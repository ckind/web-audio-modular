export default class ResourceFile {
  public blobUrl?: string;
  public name?: string;

  constructor(blobUrl?: string, name?: string) {
    this.blobUrl = blobUrl;
    this.name = name;
  }
}