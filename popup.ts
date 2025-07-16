import { Base64Decoder, Base64Encoder, DecodedResult, EncodeInput } from './decoder.ts';

// デコードフォームの要素
const decodeForm = document.getElementById('decodeForm') as HTMLFormElement;
const base64Input = document.getElementById('base64Input') as HTMLTextAreaElement;
const objectNameEl = document.getElementById('objectName') as HTMLSpanElement;
const objectIdEl = document.getElementById('objectId') as HTMLSpanElement;
const paddingEl = document.getElementById('padding') as HTMLSpanElement;

// エンコードフォームの要素
const encodeForm = document.getElementById('encodeForm') as HTMLFormElement;
const objectNameInput = document.getElementById('objectNameInput') as HTMLInputElement;
const idInput = document.getElementById('idInput') as HTMLInputElement;
const paddingInput = document.getElementById('paddingInput') as HTMLInputElement;
const encodedResultEl = document.getElementById('encodedResult') as HTMLSpanElement;

// デコード関連の関数
function showDecodeError(message: string) {
  objectNameEl.textContent = message;
  objectIdEl.textContent = '-';
  paddingEl.textContent = '-';
  objectNameEl.style.color = '#d32f2f';
}

function showDecodeResult(result: DecodedResult) {
  objectNameEl.textContent = result.objectName || '-';
  objectNameEl.style.color = '#333';
  objectIdEl.textContent = result.id !== null ? result.id.toString() : '-';
  paddingEl.textContent = result.padding || '-';
}

// エンコード関連の関数
function showEncodeError(message: string) {
  encodedResultEl.textContent = message;
  encodedResultEl.style.color = '#d32f2f';
}

function showEncodeResult(result: string) {
  encodedResultEl.textContent = result;
  encodedResultEl.style.color = '#333';
}

// エンコードフォームのイベントリスナー
encodeForm.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  
  const objectName = objectNameInput.value.trim();
  
  if (!objectName) {
    showEncodeError('オブジェクト名を入力してください');
    return;
  }

  try {
    const encodeInput: EncodeInput = {
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
decodeForm.addEventListener('submit', (e: Event) => {
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