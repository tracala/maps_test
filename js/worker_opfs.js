let fileHandle, accessHandle;
let writeOffset = 0;
const index = []; // [{offset, length}]

async function init_opfs(file_name) {
  const root = await navigator.storage.getDirectory();
  fileHandle = await root.getFileHandle(file_name, { create: true });
  accessHandle = await fileHandle.createSyncAccessHandle();
}

function appendChunk32(uint32arr) {
  const bytes = new Uint8Array(uint32arr.buffer, uint32arr.byteOffset, uint32arr.byteLength);
  return appendChunk8(bytes);
}

function appendChunk8(uint8arr) {
  const bytes = uint8arr;
  accessHandle.write(bytes, { at: writeOffset });
  index.push({ offset: writeOffset, length: uint8arr.length });
  let writeOffset_= writeOffset;
  writeOffset += bytes.byteLength;
  return writeOffset_;
}


function readChunk(i) {
  const { offset, length } = index[i];
  const buf = new ArrayBuffer(length * 4);
  accessHandle.read(new Uint8Array(buf), { at: offset });
  return new Uint32Array(buf);
}

function flush() {
  accessHandle.flush(); // asegura que se escribió a disco
}

function close() {
  accessHandle.close();
}
