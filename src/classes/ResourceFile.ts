export default class ResourceFile {
  public blobUrl?: string;
  public name?: string;
  public readonly isResourceFile: boolean = true;

  constructor(blobUrl?: string, name?: string) {
    this.blobUrl = blobUrl;
    this.name = name;
  }
}