
/**
 * A ResourceFile is a reference to a file resource in memory created via URL.createObjectURL.
 * ResourceFiles are used to manage external dependencies within patches and audio modules,
 * such as audio samples. 
 * 
 */
export default class ResourceFile {
  public name: string;
  public readonly isResourceFile: boolean = true;

  constructor(name: string) {
    this.name = name;
  }
}