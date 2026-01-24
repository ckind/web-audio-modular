type RegisteredResource = {
  blobUrl: string;
  refCount: number;
};

/**
 * Singleton manager for ResourceFiles to handle registration,
 * reference counting, and revocation of Blob URLs.
 * 
 * Blob resources must be registered using registerResource and a
 * url to a resource must acquired using requestResource. The caller that
 * requests or registers a resource is responsible for releasing that
 * resource following the RAII pattern.
 */
const ResourceFileManager = {
  debug: false,

  registerResources: new Map<string, RegisteredResource>(),

  // todo: assumes names are unique, should we allow duplicates?
  /**
   * Registers a resource with reference count of 1 and returns its Blob URL.
   * Increases reference count if the resource is already registered.
   */
  registerResource(name: string, resource: Blob | File): string {
    if (!resource) {
      throw new Error("ResourceFileManager: invalid resource provided for registration.");
    }

    const registered = this.registerResources.get(name);

    if (registered) {
      console.warn(
        `ResourceFileManager: "${name}" already registered. Returning existing resource.`,
      );
      registered.refCount++;
      return registered.blobUrl;
    }

    const blobUrl = URL.createObjectURL(resource);
    this.registerResources.set(name, { blobUrl, refCount: 1 });
    if (this.debug) console.log(`ResourceFileManager: "${name}" registered with url: ${blobUrl}`);

    return blobUrl;
  },

  /**
   * Requests a resource by name, increasing its reference count and returning its Blob URL.
   * Returns undefined if the resource is not found.
   */
  requestResource(name: string): string | undefined {
    const registered = this.registerResources.get(name);
    if (registered) {
      registered.refCount++;
      if (this.debug) console.log(
        `ResourceFileManager: "${name}" requested. refs: ${registered.refCount}`,
      );
      return registered.blobUrl;
    }
    console.warn(`ResourceFileManager: requested unregistered resource "${name}".`);
    return undefined;
  },

  /**
   * Releases a resource by name, decreasing its reference count.
   * Revokes and removes the resource if the reference count reaches zero.
   */
  releaseResource(name: string): void {
    const registered = this.registerResources.get(name);
    if (registered) {
      registered.refCount--;
      if (this.debug) console.log(
        `ResourceFileManager: "${name}" released. refs: ${registered.refCount}`,
      );
      if (registered.refCount <= 0) {
        URL.revokeObjectURL(registered.blobUrl);
        this.registerResources.delete(name);
        if (this.debug) console.log(`ResourceFileManager: "${name}" revoked and removed from manager.`);
      }
    } else {
      console.warn(`ResourceFileManager: attempted to release unregistered resource "${name}".`);
    }
  },
};

export default ResourceFileManager;
