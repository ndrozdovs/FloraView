"use strict";

let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;

const serialConnect = document.getElementById("serialConnect");
let sendRequest = false;

document.addEventListener("DOMContentLoaded", () => {
  serialConnect.addEventListener("click", clickConnect);

  //const notSupported = document.getElementById('notSupported');
  //notSupported.classList.toggle('hidden', 'serial' in navigator);
});

// Opens a Web Serial connection to a micro:bit and sets up the input and output stream
async function connect() {
  // CODELAB: Add code to request & open port here.
  // - Request a port and open a connection.
  port = await navigator.serial.requestPort();

  // - Wait for the port to open.
  await port.open({
    baudRate: 115200,
  });

  console.log(port);

  // CODELAB: Add code setup the output stream here.
  const encoder = new TextEncoderStream();
  outputDone = encoder.readable.pipeTo(port.writable);
  outputStream = encoder.writable;

  // CODELAB: Send CTRL-C and turn off echo on REPL
  //writeToStream('\x03', 'echo(false);');

  // CODELAB: Add code to read the stream here.
  let decoder = new TextDecoderStream();
  inputDone = port.readable.pipeTo(decoder.writable);
  inputStream = decoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer()));

  reader = inputStream.getReader();
  readLoop();
}

// Closes the Web Serial connection
async function disconnectSerial() {
  // CODELAB: Close the input stream (reader).
  if (reader) {
    await reader.cancel();
    await inputDone.catch(() => {});
    reader = null;
    inputDone = null;
  }

  // CODELAB: Close the output stream.
  if (outputStream) {
    await outputStream.getWriter().close();
    await outputDone;
    outputStream = null;
    outputDone = null;
  }

  // CODELAB: Close the port.
  await port.close();
  port = null;
}

// Click handler for the connect/disconnect button
async function clickConnect() {
  // CODELAB: Add connect code here.
  sendRequest = true;
  await connect();
}

// Reads data from the input stream and displays it on screen.
async function readLoop() {
  // CODELAB: Add read loop here.
  while (true) {
    const { value, done } = await reader.read();
    console.log(value);
    if (done) {
      console.log("[readLoop] DONE", done);
      reader.releaseLock();
      break;
    }
    if ((value.includes("Ready for") || value.includes("Waiting for ssid")) && sendRequest === true) {
      sendRequest = false;
      writeToStream("FloraViewWifiKeyword");
      $("#enterWifiModal").modal("show");
    }
    if (value.includes("WiFi credentials invalid")) {
      wifiIsInvalid();
      writeToStream("FloraViewWifiKeyword");
    }
    if (value.includes("WiFi credentials valid")) {
      wifiIsValid();
    }
  }
}

// Gets a writer from the output stream and send the lines to the device
function writeToStream(...lines) {
  // CODELAB: Write to output stream
  const writer = outputStream.getWriter();
  lines.forEach((line) => {
    console.log("[SEND]", line);
    writer.write(line + "\n");
  });
  writer.releaseLock();
}

// TransformStream to parse the stream into lines
class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.container = "";
  }

  transform(chunk, controller) {
    // CODELAB: Handle incoming chunk
    this.container += chunk;
    const lines = this.container.split("\r\n");
    this.container = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    // CODELAB: Flush the stream.
    controller.enqueue(this.container);
  }
}
