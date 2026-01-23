export default class ResourceFile {
  public blobUrl?: string;
  public name?: string;
  public readonly isResourceFile: boolean = true;
  private _isRevoked: boolean = false;

  constructor(blobUrl?: string, name?: string) {
    this.blobUrl = blobUrl;
    this.name = name;
  }

  /**
   * Revoke the blob URL and free memory.
   * Should be called when the resource is no longer needed.
   * Safe to call multiple times.
   */
  dispose(): void {
    if (this.blobUrl && !this._isRevoked) {
      URL.revokeObjectURL(this.blobUrl);
      this._isRevoked = true;
      console.log(`Revoked blob URL for: ${this.name}`);
    }
  }

  /**
   * Check if the resource is still valid
   */
  get isValid(): boolean {
    return !!this.blobUrl && !this._isRevoked;
  }
}