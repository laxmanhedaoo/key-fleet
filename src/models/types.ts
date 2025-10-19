

export enum KeyAction {
  ACQUIRE = "acquire",
  RELEASE = "release",
  CREATE = "create",
  EXPIRE = "expire",
}

export enum KeyStatus {
  ACTIVE = "active",          // available and ready to use
  IN_USE = "in_use",          // currently acquired by an application
  EXPIRED = "expired",        // key is no longer valid due to provider limits
  DISABLED = "disabled",      // manually marked invalid or suspended
  ERROR = "error"             // failed to validate or encountered runtime issues
}