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

export function extractFilenameFromPath(path: string): string {
  return path.split('\\').pop();
}

export function getImageFile(fileList: FileList): File|null {
  if (fileList === null) {
    return null;
  }

  let image = null;
  const imageRegex = RegExp(/^image\//);

  for (let i = 0; i < fileList.length; ++i) {
    if (imageRegex.exec(fileList[i].type)) {
      image = fileList[i];
    }
  }

  return image;
}

/**
 * Inspired by https://github.com/JedWatson/classnames.
 * @param classes Class names and their conditions.
 * @returns Joined string of class names.
 */
export function classNames(classes: Record<string, boolean>) {
  const result = [];
  const keys = Object.keys(classes);

  keys.forEach((key) => {
    if (classes[key]) {
      result.push(key);
    }
  });

  return result.join(' ');
}

export function getWebComponentParts(root: ShadowRoot): Array<Element> {
  const partsChildren = root.querySelectorAll('[part]');
  const parts = [];

  partsChildren.forEach((el: Element) => {
    const elementParts = el.getAttribute('part').split(' ');

    while (elementParts && elementParts.length) {
      parts.push(elementParts.pop());
    }
  });

  return parts;
}

export function setWebComponentParts(hostEl: Element): void {
  const partParts = [
    hostEl.tagName.toLowerCase(),
    hostEl.getAttribute('id')
  ];
  hostEl.setAttribute('part', partParts.join(' ').trim() );
}
