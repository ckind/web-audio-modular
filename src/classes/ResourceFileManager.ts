type RegisteredResource = {
  blobUrl: string;
  refCount: number;
};

/**
 * Singleton manager for ResourceFiles to handle registration,
 * reference counting, and revocation of Blob URLs.
 */
const ResourceFileManager = {
  blobUrls: new Map<string, RegisteredResource>(),

  // todo: assumes names are unique, should we allow duplicates?
  /**
   * Registers a resource with reference count of 1 and returns its Blob URL.
   * Increases reference count if the resource is already registered.
   */
  registerResource(name: string, resource: Blob | File): string {
    if (!resource) {
      throw new Error("Invalid resource provided for registration.");
    }

    const registered = this.blobUrls.get(name);

    if (registered) {
      console.warn(
        `Resource ${name} already registered. Returning existing url.`,
      );
      registered.refCount++;
      return registered.blobUrl;
    }

    const blobUrl = URL.createObjectURL(resource);
    this.blobUrls.set(name, { blobUrl, refCount: 1 });
    console.log(`Registered resource: ${blobUrl}`);

    return blobUrl;
  },

  /**
   * Requests a resource by name, increasing its reference count and returning its Blob URL.
   * Returns undefined if the resource is not found.
   */
  requestResource(name: string): string | undefined {
    const registered = this.blobUrls.get(name);
    if (registered) {
      registered.refCount++;
      console.log(
        `Resource "${name}" requested. New refCount: ${registered.refCount}`,
      );
      return registered.blobUrl;
    }
    console.warn(`Resource "${name}" not found.`);
    return undefined;
  },

  /**
   * Releases a resource by name, decreasing its reference count.
   * Revokes and removes the resource if the reference count reaches zero.
   */
  releaseResource(name: string): void {
    const registered = this.blobUrls.get(name);
    if (registered) {
      registered.refCount--;
      console.log(
        `Resource "${name}" released. New refCount: ${registered.refCount}`,
      );
      if (registered.refCount <= 0) {
        URL.revokeObjectURL(registered.blobUrl);
        this.blobUrls.delete(name);
        console.log(`Resource "${name}" revoked and removed from manager.`);
      }
    } else {
      console.warn(`Resource "${name}" not found for release.`);
    }
  },
};

export default ResourceFileManager;
