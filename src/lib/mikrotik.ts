import { RouterOSAPI } from 'node-routeros';
import axios from 'axios';

export interface MikroTikConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  version: 'v6' | 'v7';
  useSSL?: boolean;
  timeout?: number;
}

export interface MikroTikUser {
  name: string;
  password: string;
  profile: string;
  uptime?: string;
  bytesIn?: number;
  bytesOut?: number;
  bytesInCom?: number;
  bytesOutCom?: number;
  packetIn?: number;
  packetOut?: number;
  packetInCom?: number;
  packetOutCom?: number;
  limitBytesIn?: number;
  limitBytesOut?: number;
  limitBytesTotal?: number;
  limitUptime?: string;
  comment?: string;
  disabled?: boolean;
}

export interface MikroTikProfile {
  name: string;
  rateLimit?: string;
  actualRateIn?: string;
  actualRateOut?: string;
  priority?: number;
  parent?: string;
  comment?: string;
}

export interface VoucherData {
  username: string;
  password: string;
  profile: string;
  timeLimit?: string;
  dataLimit?: string;
  comment?: string;
}

export class MikroTikManager {
  private config: MikroTikConfig;
  private connection: RouterOSAPI | null = null;

  constructor(config: MikroTikConfig) {
    this.config = {
      timeout: 10000,
      useSSL: false,
      ...config
    };
  }

  async connect(): Promise<void> {
    try {
      if (this.config.version === 'v7') {
        // For RouterOS v7, we can use REST API if available
        await this.connectV7();
      } else {
        // For RouterOS v6, use API
        await this.connectV6();
      }
    } catch (error) {
      throw new Error(`Failed to connect to MikroTik: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async connectV6(): Promise<void> {
    try {
      const api = new RouterOSAPI({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        timeout: this.config.timeout
      });
      this.connection = await api.connect();
    } catch (error) {
      throw new Error(`RouterOS v6 connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async connectV7(): Promise<void> {
    // For RouterOS v7, try REST API first, fallback to legacy API
    try {
      const response = await axios.get(`http${this.config.useSSL ? 's' : ''}://${this.config.host}:${this.config.port}/rest/system/resource`, {
        auth: {
          username: this.config.username,
          password: this.config.password
        },
        timeout: this.config.timeout
      });
      
      if (response.status === 200) {
        return; // REST API is available
      }
    } catch (error) {
      // Fallback to legacy API for v7
      await this.connectV6();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      const systemInfo = await this.getSystemInfo();
      await this.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSystemInfo(): Promise<any> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const systemResource = await this.connection.write('/system/resource/print');
      const systemIdentity = await this.connection.write('/system/identity/print');
      
      return {
        resource: systemResource[0],
        identity: systemIdentity[0]
      };
    } catch (error) {
      throw new Error(`Failed to get system info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createVoucher(voucherData: VoucherData): Promise<MikroTikUser> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      // Create user in RouterOS
      const userParams: any = {
        name: voucherData.username,
        password: voucherData.password,
        profile: voucherData.profile,
        comment: voucherData.comment || `Voucher created at ${new Date().toISOString()}`
      };

      // Add time limit if specified
      if (voucherData.timeLimit) {
        userParams.limitUptime = voucherData.timeLimit;
      }

      // Add data limit if specified
      if (voucherData.dataLimit) {
        userParams.limitBytesTotal = this.parseDataLimit(voucherData.dataLimit);
      }

      const result = await this.connection.write('/ip/hotspot/user/add', userParams);
      
      // Get the created user details
      const users = await this.connection.write('/ip/hotspot/user/print', [
        '?name=' + voucherData.username
      ]);

      return users[0] as any;
    } catch (error) {
      throw new Error(`Failed to create voucher: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(username: string): Promise<MikroTikUser | null> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const users = await this.connection.write('/ip/hotspot/user/print', [
        '?name=' + username
      ]);

      return users.length > 0 ? (users[0] as any) : null;
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateUser(username: string, updates: Partial<MikroTikUser>): Promise<void> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const user = await this.getUser(username);
      if (!user) {
        throw new Error(`User ${username} not found`);
      }

      // Find the internal ID of the user
      const users = await this.connection.write('/ip/hotspot/user/print');
      const targetUser = users.find((u: any) => u.name === username);
      
      if (!targetUser || !targetUser['.id']) {
        throw new Error(`User ${username} not found or missing ID`);
      }

      const setParams: any = {
        '.id': targetUser['.id'],
        ...updates
      };
      await this.connection.write('/ip/hotspot/user/set', setParams);
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteUser(username: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const users = await this.connection.write('/ip/hotspot/user/print');
      const targetUser = users.find((u: any) => u.name === username);
      
      if (!targetUser || !targetUser['.id']) {
        throw new Error(`User ${username} not found`);
      }

      await this.connection.write('/ip/hotspot/user/remove', [
        '=.id=' + targetUser['.id']
      ]);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProfiles(): Promise<MikroTikProfile[]> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const profiles = await this.connection.write('/ip/hotspot/user/profile/print');
      return profiles as any;
    } catch (error) {
      throw new Error(`Failed to get profiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActiveUsers(): Promise<MikroTikUser[]> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const activeUsers = await this.connection.write('/ip/hotspot/active/print');
      return activeUsers as any;
    } catch (error) {
      throw new Error(`Failed to get active users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUsersByProfile(profile: string): Promise<MikroTikUser[]> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const users = await this.connection.write('/ip/hotspot/user/print', [
        '?profile=' + profile
      ]);
      return users as any;
    } catch (error) {
      throw new Error(`Failed to get users by profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserStatistics(username: string): Promise<any> {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      const user = await this.getUser(username);
      const activeUsers = await this.getActiveUsers();
      const activeUser = activeUsers.find((u: any) => u.user === username || u.name === username);

      return {
        user,
        active: activeUser,
        isActive: !!activeUser,
        sessionTime: activeUser?.uptime || '0s',
        dataUsage: {
          in: activeUser?.bytesIn || 0,
          out: activeUser?.bytesOut || 0,
          total: (activeUser?.bytesIn || 0) + (activeUser?.bytesOut || 0)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseDataLimit(dataLimit: string): number {
    // Parse data limit like "1GB", "500MB", "2GB" to bytes
    const units: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    const match = dataLimit.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
    if (!match) {
      throw new Error(`Invalid data limit format: ${dataLimit}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    return Math.floor(value * units[unit]);
  }

  async generateVoucherCode(length: number = 8): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async generatePassword(length: number = 8): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default MikroTikManager;