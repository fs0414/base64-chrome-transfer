export interface DecodedResult {
  objectName: string;
  id: number | null;
  padding: string | null;
}

export interface EncodeInput {
  objectName: string;
  id?: number;
  padding?: string;
}

export class Base64Decoder {
  static decode(input: string): DecodedResult {
    try {
      const decoded = atob(input);
      
      return this.parseDecodedString(decoded);
    } catch (error) {
      return {
        objectName: `Error: ${error.message}`,
        id: null,
        padding: null
      };
    }
  }

  private static parseDecodedString(decoded: string): DecodedResult {
    if (decoded.startsWith('{')) {
      try {
        const json = JSON.parse(decoded);
        return {
          objectName: json.name || json.objectName || 'Unknown',
          id: typeof json.id === 'number' ? json.id : null,
          padding: json.padding || null
        };
      } catch {
      }
    }

    const parts = decoded.split(':');
    
    if (parts.length >= 2) {
      return {
        objectName: parts[0],
        id: this.parseId(parts[1]),
        padding: parts.length > 2 ? parts.slice(2).join(':') : null
      };
    }

    return {
      objectName: decoded,
      id: null,
      padding: null
    };
  }

  private static parseId(idStr: string): number | null {
    const id = parseInt(idStr, 10);
    return isNaN(id) ? null : id;
  }

  static detectPadding(input: string): string | null {
    const match = input.match(/=+$/);
    return match ? match[0] : null;
  }
}

export class Base64Encoder {
  static encode(input: EncodeInput): string {
    try {
      const dataString = this.createDataString(input);
      return btoa(dataString);
    } catch (error) {
      throw new Error(`Encoding error: ${error.message}`);
    }
  }

  private static createDataString(input: EncodeInput): string {
    const parts: string[] = [input.objectName];
    
    if (input.id !== undefined) {
      parts.push(input.id.toString());
    }
    
    if (input.padding !== undefined && input.padding !== '') {
      parts.push(input.padding);
    }
    
    return parts.join(':');
  }

  static encodeAsJSON(input: EncodeInput): string {
    try {
      const jsonData = {
        objectName: input.objectName,
        ...(input.id !== undefined && { id: input.id }),
        ...(input.padding !== undefined && input.padding !== '' && { padding: input.padding })
      };
      
      return btoa(JSON.stringify(jsonData));
    } catch (error) {
      throw new Error(`JSON encoding error: ${error.message}`);
    }
  }
}

export class AdvancedDecoder {
  static decodeBinary(input: string): DecodedResult {
    try {
      const binaryString = atob(input);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (bytes.length >= 8) {
        const objectType = this.bytesToString(bytes.slice(0, 4));
        const id = this.bytesToInt32(bytes.slice(4, 8));
        const padding = bytes.length > 8 ? 
          this.bytesToString(bytes.slice(8)) : null;

        return {
          objectName: objectType,
          id: id,
          padding: padding
        };
      }

      return {
        objectName: this.bytesToString(bytes),
        id: null,
        padding: null
      };
    } catch (error) {
      return {
        objectName: `Binary decode error: ${error.message}`,
        id: null,
        padding: null
      };
    }
  }

  private static bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  private static bytesToInt32(bytes: Uint8Array): number {
    return new DataView(bytes.buffer).getInt32(0, false);
  }
}