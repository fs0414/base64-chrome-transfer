(function() {
  
  // decoder.ts
  class Base64Decoder {
    static decode(input) {
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

    static parseDecodedString(decoded) {
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

    static parseId(idStr) {
      const id = parseInt(idStr, 10);
      return isNaN(id) ? null : id;
    }

    static detectPadding(input) {
      const match = input.match(/=+$/);
      return match ? match[0] : null;
    }
  }

  class Base64Encoder {
    static encode(input) {
      try {
        const dataString = this.createDataString(input);
        return btoa(dataString);
      } catch (error) {
        throw new Error(`Encoding error: ${error.message}`);
      }
    }

    static createDataString(input) {
      const parts = [input.objectName];
      
      if (input.id !== undefined) {
        parts.push(input.id.toString());
      }
      
      if (input.padding !== undefined && input.padding !== '') {
        parts.push(input.padding);
      }
      
      return parts.join(':');
    }

    static encodeAsJSON(input) {
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

  class AdvancedDecoder {
    static decodeBinary(input) {
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

    static bytesToString(bytes) {
      return new TextDecoder().decode(bytes);
    }

    static bytesToInt32(bytes) {
      return new DataView(bytes.buffer).getInt32(0, false);
    }
  }
  
  // popup.ts
  // デコードフォームの要素
  const decodeForm = document.getElementById('decodeForm');
  const base64Input = document.getElementById('base64Input');
  const objectNameEl = document.getElementById('objectName');
  const objectIdEl = document.getElementById('objectId');
  const paddingEl = document.getElementById('padding');

  // エンコードフォームの要素
  const encodeForm = document.getElementById('encodeForm');
  const objectNameInput = document.getElementById('objectNameInput');
  const idInput = document.getElementById('idInput');
  const paddingInput = document.getElementById('paddingInput');
  const encodedResultEl = document.getElementById('encodedResult');

  // デコード関連の関数
  function showDecodeError(message) {
    objectNameEl.textContent = message;
    objectIdEl.textContent = '-';
    paddingEl.textContent = '-';
    objectNameEl.style.color = '#d32f2f';
  }

  function showDecodeResult(result) {
    objectNameEl.textContent = result.objectName || '-';
    objectNameEl.style.color = '#333';
    objectIdEl.textContent = result.id !== null ? result.id.toString() : '-';
    paddingEl.textContent = result.padding || '-';
  }

  // エンコード関連の関数
  function showEncodeError(message) {
    encodedResultEl.textContent = message;
    encodedResultEl.style.color = '#d32f2f';
  }

  function showEncodeResult(result) {
    encodedResultEl.textContent = result;
    encodedResultEl.style.color = '#333';
  }

  // エンコードフォームのイベントリスナー
  encodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const objectName = objectNameInput.value.trim();
    
    if (!objectName) {
      showEncodeError('オブジェクト名を入力してください');
      return;
    }

    try {
      const encodeInput = {
        objectName: objectName,
        id: idInput.value ? parseInt(idInput.value, 10) : undefined,
        padding: paddingInput.value.trim() || undefined
      };
      
      const result = Base64Encoder.encode(encodeInput);
      showEncodeResult(result);
    } catch (error) {
      showEncodeError(`エンコードエラー: ${error.message}`);
    }
  });

  // デコードフォームのイベントリスナー
  decodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const base64Value = base64Input.value.trim();
    
    if (!base64Value) {
      showDecodeError('Base64値を入力してください');
      return;
    }

    try {
      const result = Base64Decoder.decode(base64Value);
      
      const inputPadding = Base64Decoder.detectPadding(base64Value);
      if (inputPadding && !result.padding) {
        result.padding = `Input padding: ${inputPadding}`;
      }
      
      showDecodeResult(result);
    } catch (error) {
      showDecodeError(`デコードエラー: ${error.message}`);
    }
  });

  const sampleData = {
    simple: btoa('TestObject:12345:somePadding'),
    json: btoa(JSON.stringify({ objectName: 'User', id: 789, padding: 'none' })),
    binary: btoa('TYPE0001')
  };

  console.log('Sample Base64 data:', sampleData);
})();