/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

export function stringToArray(inputString: string): Array<string> {
  if (!inputString || !inputString.length) {
    return [];
  }

  return inputString.split(',').map(el => el.trim());
}

export function stringToObject(inputString: string): { [key: string]: any } {
  if (!inputString || !inputString.length) {
    return {};
  }

  return JSON.parse(inputString);
}

export function hasSupportedImageFiles(files: FileList): boolean {
  const imageRegex = RegExp(/^image\//);

  for (let i = 0; i < files.length; ++i) {
    if (imageRegex.exec(files[i].type)) {
      return true;
    }
  }

  return false;
}
