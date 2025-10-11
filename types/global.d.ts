// Browser Extension Global Types

declare global {
  namespace browser {
    namespace storage {
      namespace local {
        function get(keys?: string | string[] | null): Promise<Record<string, any>>;
        function set(items: Record<string, any>): Promise<void>;
        function remove(keys: string | string[]): Promise<void>;
        function clear(): Promise<void>;
      }
    }

    namespace tabs {
      interface Tab {
        id?: number;
        url?: string;
        title?: string;
        active?: boolean;
        windowId?: number;
      }

      function query(queryInfo: {
        active?: boolean;
        currentWindow?: boolean;
        url?: string | string[];
      }): Promise<Tab[]>;

      function executeScript(
        tabId: number | undefined,
        details: {
          code?: string;
          file?: string;
          allFrames?: boolean;
        }
      ): Promise<any[]>;

      function insertCSS(
        tabId: number | undefined,
        details: {
          code?: string;
          file?: string;
          allFrames?: boolean;
        }
      ): Promise<void>;
    }

    namespace runtime {
      function sendMessage(message: any): Promise<any>;
      const onMessage: {
        addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean | Promise<any>): void;
      };
      const onInstalled: {
        addListener(callback: (details: { reason: string }) => void): void;
      };
    }

    namespace action {
      function setBadgeText(details: { text: string; tabId?: number }): Promise<void>;
      function setBadgeBackgroundColor(details: { color: string | [number, number, number, number]; tabId?: number }): Promise<void>;
    }

    namespace alarms {
      interface Alarm {
        name: string;
        scheduledTime: number;
        periodInMinutes?: number;
      }

      function create(name: string, alarmInfo: {
        delayInMinutes?: number;
        periodInMinutes?: number;
        when?: number;
      }): void;

      function clear(name: string): Promise<boolean>;

      function getAll(): Promise<Alarm[]>;

      const onAlarm: {
        addListener(callback: (alarm: Alarm) => void): void;
      };
    }

    namespace permissions {
      function request(permissions: { permissions?: string[]; origins?: string[] }): Promise<boolean>;
      function contains(permissions: { permissions?: string[]; origins?: string[] }): Promise<boolean>;
    }
  }

  namespace chrome {
    // Chrome-specific APIs that might differ from browser.*
    namespace storage {
      namespace local {
        function get(keys?: string | string[] | null, callback?: (result: Record<string, any>) => void): void;
        function set(items: Record<string, any>, callback?: () => void): void;
        function remove(keys: string | string[], callback?: () => void): void;
        function clear(callback?: () => void): void;
      }
    }

    namespace tabs {
      function query(queryInfo: any, callback: (tabs: any[]) => void): void;
      function executeScript(tabId: number | undefined, details: any, callback?: (result: any[]) => void): void;
      function insertCSS(tabId: number | undefined, details: any, callback?: () => void): void;
    }

    namespace runtime {
      function sendMessage(message: any, callback?: (response: any) => void): void;
      const onMessage: {
        addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean): void;
      };
      const onInstalled: {
        addListener(callback: (details: { reason: string }) => void): void;
      };
    }

    namespace action {
      function setBadgeText(details: { text: string; tabId?: number }, callback?: () => void): void;
      function setBadgeBackgroundColor(details: { color: string | [number, number, number, number]; tabId?: number }, callback?: () => void): void;
    }

    namespace alarms {
      function create(name: string, alarmInfo: any): void;
      function clear(name: string, callback?: (wasCleared: boolean) => void): void;
      function getAll(callback: (alarms: any[]) => void): void;
      const onAlarm: {
        addListener(callback: (alarm: any) => void): void;
      };
    }
  }
}

// EverTrack specific types
export interface WorkSchedule {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

export interface ProjectSettings {
  name: string;
  totalHours: number;
  deadline: string;
  workSchedule: WorkSchedule;
  holidayApiKey?: string;
  excludeHolidays: boolean;
  timeZone: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  start: number;
  end?: number;
  duration?: number;
  description?: string;
  tags?: string[];
}

export interface ProjectProgress {
  totalTracked: number;
  totalRequired: number;
  percentage: number;
  remainingHours: number;
  averagePerDay: number;
  onTrack: boolean;
  daysRemaining: number;
}

export interface Holiday {
  date: string;
  name: string;
  country?: string;
  region?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TimerState {
  isRunning: boolean;
  startTime?: number;
  currentDuration: number;
  projectId?: string;
}

export interface DOMElementInfo {
  selector: string;
  text?: string;
  href?: string;
  className?: string;
  id?: string;
}

export {};