async function buildExtension() {
  console.log("Building Chrome extension...");

  // decoder.tsをインラインでバンドル
  const decoderCode = await Deno.readTextFile("./decoder.ts");
  const popupCode = await Deno.readTextFile("./popup.ts");

  // exportとimportを削除してコードを結合
  const cleanedDecoderCode = decoderCode
    .replace(/export\s+/g, "")
    .replace(/export\s*\{[^}]*\}\s*;?\s*/g, "")
    .replace(/interface\s+\w+\s*\{[^}]*\}\s*/g, "")  // interface定義を削除
    .replace(/:\s*\w+(\[\])?/g, "")  // 型注釈を削除
    .replace(/as\s+\w+/g, "");  // 型キャストを削除
  
  const cleanedPopupCode = popupCode.replace(
    /import\s*{\s*.*?\s*}\s*from\s*['"]\.\/decoder\.ts['"];?\s*/,
    ""
  )
    .replace(/:\s*\w+(\[\])?/g, "")  // 型注釈を削除
    .replace(/as\s+\w+/g, "");  // 型キャストを削除

  // インライン化したコードを作成（即座に実行される関数でラップ）
  const combinedCode = `
(function() {
  
  // decoder.ts
  ${cleanedDecoderCode}
  
  // popup.ts
  ${cleanedPopupCode}
})();
`;

  // popup.jsとして出力
  await Deno.writeTextFile("popup.js", combinedCode);
  console.log("✓ popup.js created");

  console.log("Build complete!");
  console.log("\nNext steps:");
  console.log("1. Open Chrome and navigate to chrome://extensions/");
  console.log("2. Enable 'Developer mode'");
  console.log("3. Click 'Load unpacked' and select this directory");
}

// ビルド実行
if (import.meta.main) {
  buildExtension();
}
