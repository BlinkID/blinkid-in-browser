/*! ****************************************************************************
Copyright (c) Microblink. All rights reserved.

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
***************************************************************************** */
(function () {
    'use strict';

    let nextMessageID = 0;
    function getNextMessageID() {
        const msgId = nextMessageID;
        nextMessageID = nextMessageID + 1;
        return msgId;
    }
    class BaseRequestMessage {
        constructor(action) {
            this.action = action;
            this.messageID = getNextMessageID();
        }
    }
    class InitMessage extends BaseRequestMessage {
        constructor(wasmLoadSettings, userId) {
            super(InitMessage.action);
            this.wasmModuleName = wasmLoadSettings.wasmModuleName;
            this.licenseKey = wasmLoadSettings.licenseKey;
            this.userId = userId;
            this.registerLoadCallback = wasmLoadSettings.loadProgressCallback !== null;
            this.allowHelloMessage = wasmLoadSettings.allowHelloMessage;
            this.engineLocation = wasmLoadSettings.engineLocation;
        }
    }
    InitMessage.action = "init";
    var ParameterType;
    (function (ParameterType) {
        ParameterType[ParameterType["Any"] = 0] = "Any";
        ParameterType[ParameterType["Recognizer"] = 1] = "Recognizer";
    })(ParameterType || (ParameterType = {}));
    class InvokeFunction extends BaseRequestMessage {
        constructor(funcName, params) {
            super(InvokeFunction.action);
            this.funcName = funcName;
            this.params = params;
        }
    }
    InvokeFunction.action = "invokeFunction";
    class CreateNewRecognizer extends BaseRequestMessage {
        constructor(className, params) {
            super(CreateNewRecognizer.action);
            this.className = className;
            this.params = params;
        }
    }
    CreateNewRecognizer.action = "createNewNativeObject";
    class CreateRecognizerRunner extends BaseRequestMessage {
        constructor(recognizerHandles, allowMultipleResults, registeredMetadataCallbacks) {
            super(CreateRecognizerRunner.action);
            this.recognizerHandles = recognizerHandles;
            this.allowMultipleResults = allowMultipleResults;
            this.registeredMetadataCallbacks = registeredMetadataCallbacks;
        }
    }
    CreateRecognizerRunner.action = "createRecognizerRunner";
    class ReconfigureRecognizerRunner extends BaseRequestMessage {
        constructor(recognizerHandles, allowMultipleResults) {
            super(ReconfigureRecognizerRunner.action);
            this.recognizerHandles = recognizerHandles;
            this.allowMultipleResults = allowMultipleResults;
        }
    }
    ReconfigureRecognizerRunner.action = "reconfigureRecognizerRunner";
    class DeleteRecognizerRunner extends BaseRequestMessage {
        constructor() {
            super(DeleteRecognizerRunner.action);
        }
    }
    DeleteRecognizerRunner.action = "deleteRecognizerRunner";
    class InvokeObjectMethod extends BaseRequestMessage {
        constructor(objectHandle, methodName, params) {
            super(InvokeObjectMethod.action);
            this.objectHandle = objectHandle;
            this.methodName = methodName;
            this.params = params;
        }
    }
    InvokeObjectMethod.action = "invokeObject";
    class ProcessImage extends BaseRequestMessage {
        constructor(image) {
            super(ProcessImage.action);
            this.frame = image;
        }
        getTransferrables() {
            return [this.frame.imageData.data.buffer];
        }
    }
    ProcessImage.action = "processImage";
    class ResetRecognizers extends BaseRequestMessage {
        constructor(hardReset) {
            super(ResetRecognizers.action);
            this.hardReset = hardReset;
        }
    }
    ResetRecognizers.action = "resetRecognizers";
    class RegisterMetadataCallbacks extends BaseRequestMessage {
        constructor(registeredMetadataCallbacks) {
            super(RegisterMetadataCallbacks.action);
            this.registeredMetadataCallbacks = registeredMetadataCallbacks;
        }
    }
    RegisterMetadataCallbacks.action = "registerMetadataCallbacks";
    class SetDetectionOnly extends BaseRequestMessage {
        constructor(detectionOnlyMode) {
            super(SetDetectionOnly.action);
            this.detectionOnlyMode = detectionOnlyMode;
        }
    }
    SetDetectionOnly.action = "setDetectionOnly";
    class SetClearTimeoutCallback extends BaseRequestMessage {
        constructor(callbackNonEmpty) {
            super(SetClearTimeoutCallback.action);
            this.callbackNonEmpty = callbackNonEmpty;
        }
    }
    SetClearTimeoutCallback.action = "setClearTimeoutCallback";
    class SetCameraPreviewMirrored extends BaseRequestMessage {
        constructor(cameraPreviewMirrored) {
            super(SetCameraPreviewMirrored.action);
            this.cameraPreviewMirrored = cameraPreviewMirrored;
        }
    }
    SetCameraPreviewMirrored.action = "setCameraPreviewMirrored";
    class StatusMessage {
        constructor(msgID, success, error) {
            this.success = true;
            this.error = null;
            this.messageID = msgID;
            this.success = success;
            this.error = error;
        }
    }
    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/explicit-module-boundary-types,
                      @typescript-eslint/no-unsafe-assignment */
    class InvokeResultMessage extends StatusMessage {
        constructor(msgID, result) {
            super(msgID, true, null);
            this.result = result;
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any,
                     @typescript-eslint/explicit-module-boundary-types,
                     @typescript-eslint/no-unsafe-assignment */
    class ObjectCreatedMessage extends StatusMessage {
        constructor(msgID, handle) {
            super(msgID, true, null);
            this.objectHandle = handle;
        }
    }
    class ImageProcessResultMessage extends StatusMessage {
        constructor(msgID, recognitionState) {
            super(msgID, true, null);
            this.recognitionState = recognitionState;
        }
    }
    // ===================================== /
    // Load progress messages
    // ===================================== /
    class LoadProgressMessage {
        constructor(progress) {
            this.isLoadProgressMessage = true;
            this.progress = progress;
        }
    }
    // ===================================== /
    // Metadata callback messages
    // ===================================== /
    var MetadataCallback;
    (function (MetadataCallback) {
        MetadataCallback[MetadataCallback["onDebugText"] = 0] = "onDebugText";
        MetadataCallback[MetadataCallback["onDetectionFailed"] = 1] = "onDetectionFailed";
        MetadataCallback[MetadataCallback["onQuadDetection"] = 2] = "onQuadDetection";
        MetadataCallback[MetadataCallback["onPointsDetection"] = 3] = "onPointsDetection";
        MetadataCallback[MetadataCallback["onFirstSideResult"] = 4] = "onFirstSideResult";
        MetadataCallback[MetadataCallback["clearTimeoutCallback"] = 5] = "clearTimeoutCallback";
        MetadataCallback[MetadataCallback["onGlare"] = 6] = "onGlare";
    })(MetadataCallback || (MetadataCallback = {}));
    /* eslint-disable @typescript-eslint/no-explicit-any */
    class InvokeCallbackMessage {
        constructor(callbackType, callbackParams) {
            this.isCallbackMessage = true;
            this.callbackType = callbackType;
            this.callbackParameters = callbackParams;
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    /**
     * Returns safe path, i.e. URL for given path and filename (file path).
     *
     * @param path      String representing file path.
     * @param fileName  String representing file name.
     * @returns String representing URL for specified resource.
     */
    function getSafePath(path, fileName) {
        // Since this function is called by Emscripten module, make sure to set default values
        path = path || "";
        fileName = fileName || "";
        if (path === "") {
            return fileName;
        }
        if (path.endsWith("/")) {
            if (fileName.startsWith("/")) {
                return path + fileName.substring(1);
            }
            return path + fileName;
        }
        if (fileName.startsWith("/")) {
            return path + fileName;
        }
        return path + "/" + fileName;
    }

    function convertEmscriptenStatusToProgress(emStatus) {
        // roughly based on https://github.com/emscripten-core/emscripten/blob/1.39.11/src/shell.html#L1259
        if (emStatus === "Running...") {
            // download has completed, wasm execution has started
            return 100;
        }
        else if (emStatus.length === 0) {
            // empty message
            return 0;
        }
        const regExp = RegExp(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        const match = regExp.exec(emStatus);
        if (match) {
            const currentValue = parseInt(match[2]);
            const maxValue = parseInt(match[4]);
            return currentValue * 100 / maxValue;
        }
        else {
            // Cannot parse emscripten status
            return NaN;
        }
    }

    class MicroblinkWorker {
        /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-explicit-any */
        constructor() {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                              @typescript-eslint/no-explicit-any */
            this.context = self;
            this.wasmModule = null;
            this.nativeRecognizerRunner = null;
            this.objects = {};
            this.nextObjectHandle = 0;
            this.metadataCallbacks = {};
            this.clearTimeoutCallback = null;
            /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                              @typescript-eslint/no-unsafe-member-access */
            this.context.onmessage = (event) => {
                const msg = event.data;
                switch (msg.action) {
                    case InitMessage.action:
                        this.processInitMessage(msg);
                        break;
                    case InvokeFunction.action:
                        this.processInvokeFunction(msg);
                        break;
                    case CreateNewRecognizer.action:
                        this.processCreateNewRecognizer(msg);
                        break;
                    case InvokeObjectMethod.action:
                        this.processInvokeObject(msg);
                        break;
                    case CreateRecognizerRunner.action:
                        this.processCreateRecognizerRunner(msg);
                        break;
                    case ReconfigureRecognizerRunner.action:
                        this.processReconfigureRecognizerRunner(msg);
                        break;
                    case DeleteRecognizerRunner.action:
                        this.processDeleteRecognizerRunner(msg);
                        break;
                    case ProcessImage.action:
                        void this.processImage(msg);
                        break;
                    case ResetRecognizers.action:
                        this.resetRecognizers(msg);
                        break;
                    case SetDetectionOnly.action:
                        this.setDetectionOnly(msg);
                        break;
                    case SetCameraPreviewMirrored.action:
                        this.setCameraPreviewMirrored(msg);
                        break;
                    case RegisterMetadataCallbacks.action:
                        this.registerMetadataCallbacks(msg);
                        break;
                    case SetClearTimeoutCallback.action:
                        this.registerClearTimeoutCallback(msg);
                        break;
                    default:
                        throw new Error("Unknown message action: " + JSON.stringify(msg.action));
                }
            };
            /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                             @typescript-eslint/no-unsafe-member-access */
        }
        getNextObjectHandle() {
            const handle = this.nextObjectHandle;
            this.nextObjectHandle = this.nextObjectHandle + 1;
            return handle;
        }
        notifyError(originalMessage, error) {
            this.context.postMessage(new StatusMessage(originalMessage.messageID, false, error));
        }
        notifySuccess(originalMessage) {
            this.context.postMessage(new StatusMessage(originalMessage.messageID, true, null));
        }
        /* eslint-disable @typescript-eslint/no-explicit-any,
                          @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-member-access,
                          @typescript-eslint/no-unsafe-return */
        unwrapParameters(msgWithParams) {
            const params = [];
            for (const wrappedParam of msgWithParams.params) {
                let unwrappedParam = wrappedParam.parameter;
                if (wrappedParam.type === ParameterType.Recognizer) {
                    unwrappedParam = this.objects[unwrappedParam];
                    if (unwrappedParam === undefined) {
                        this.notifyError(msgWithParams, "Cannot find object with handle: undefined");
                    }
                }
                params.push(unwrappedParam);
            }
            return params;
        }
        /* eslint-enable @typescript-eslint/no-explicit-any,
                         @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-unsafe-member-access,
                         @typescript-eslint/no-unsafe-return */
        /* eslint-disable @typescript-eslint/no-explicit-any,
                          @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-member-access */
        scanForTransferrables(object) {
            if (typeof object === "object") {
                const keys = Object.keys(object);
                const transferrables = [];
                for (const key of keys) {
                    const data = object[key];
                    if (data instanceof ImageData) {
                        transferrables.push(data.data.buffer);
                    }
                    else if (data instanceof Uint8Array) {
                        transferrables.push(data.buffer);
                    }
                    else if (data !== null && typeof data === "object") {
                        transferrables.push(...this.scanForTransferrables(data));
                    }
                }
                return transferrables;
            }
            else {
                return [];
            }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any,
                         @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-unsafe-member-access */
        // message process functions
        /* eslint-disable @typescript-eslint/no-explicit-any,
                          @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-call,
                          @typescript-eslint/no-unsafe-member-access */
        processInitMessage(msg) {
            // See https://emscripten.org/docs/api_reference/module.html
            const module = {
                locateFile: (path) => {
                    return getSafePath(msg.engineLocation, path);
                }
            };
            if (msg.registerLoadCallback) {
                Object.assign(module, {
                    setStatus: (text) => {
                        const msg = new LoadProgressMessage(convertEmscriptenStatusToProgress(text));
                        this.context.postMessage(msg);
                    }
                });
            }
            try {
                const jsName = msg.wasmModuleName + ".js";
                const jsPath = getSafePath(msg.engineLocation, jsName);
                importScripts(jsPath);
                const loaderFunc = self[msg.wasmModuleName];
                loaderFunc(module).then((mbWasmModule) => {
                    try {
                        mbWasmModule.initializeWithLicenseKey(msg.licenseKey, msg.userId, msg.allowHelloMessage);
                        this.wasmModule = mbWasmModule;
                        this.notifySuccess(msg);
                    }
                    catch (licenseError) {
                        this.notifyError(msg, licenseError);
                    }
                }, (error) => {
                    // Failed to load WASM in web worker due to error
                    this.notifyError(msg, error);
                });
            }
            catch (error) {
                // Failed to load WASM in web worker due to error
                this.notifyError(msg, error);
            }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any,
                         @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-unsafe-call,
                         @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-call,
                          @typescript-eslint/no-unsafe-member-access */
        processInvokeFunction(msg) {
            if (this.wasmModule === null) {
                this.notifyError(msg, "WASM module is not initialized!");
                return;
            }
            const funcName = msg.funcName;
            const params = this.unwrapParameters(msg);
            try {
                const invocationResult = this.wasmModule[funcName](...params);
                this.context.postMessage(new InvokeResultMessage(msg.messageID, invocationResult));
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-unsafe-call,
                         @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-call,
                          @typescript-eslint/no-unsafe-member-access */
        processCreateNewRecognizer(msg) {
            if (this.wasmModule === null) {
                this.notifyError(msg, "WASM module is not initialized!");
                return;
            }
            const className = msg.className;
            const params = this.unwrapParameters(msg);
            try {
                const createdObject = new this.wasmModule[className](...params);
                const newHandle = this.getNextObjectHandle();
                this.objects[newHandle] = createdObject;
                this.context.postMessage(new ObjectCreatedMessage(msg.messageID, newHandle));
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-call,
                          @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-explicit-any,
                          @typescript-eslint/no-unsafe-return */
        getRecognizers(recognizerHandles) {
            const recognizers = [];
            for (const handle of recognizerHandles) {
                const recognizer = this.objects[handle];
                recognizers.push(recognizer);
            }
            return recognizers;
        }
        /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-explicit-any,
                         @typescript-eslint/no-unsafe-return */
        processCreateRecognizerRunner(msg) {
            if (this.wasmModule === null) {
                this.notifyError(msg, "WASM module is not initialized!");
            }
            else if (this.nativeRecognizerRunner !== null) {
                this.notifyError(msg, "Recognizer runner is already created! Multiple instances are not allowed!");
            }
            else {
                this.setupMetadataCallbacks(msg.registeredMetadataCallbacks);
                try {
                    const recognizers = this.getRecognizers(msg.recognizerHandles);
                    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                      @typescript-eslint/no-unsafe-member-access,
                                      @typescript-eslint/no-unsafe-call */
                    this.nativeRecognizerRunner = new this.wasmModule.RecognizerRunner(recognizers, msg.allowMultipleResults, this.metadataCallbacks);
                    /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                     @typescript-eslint/no-unsafe-member-access,
                                     @typescript-eslint/no-unsafe-call */
                    this.notifySuccess(msg);
                }
                catch (error) {
                    this.notifyError(msg, error);
                }
            }
        }
        processReconfigureRecognizerRunner(msg) {
            if (this.wasmModule === null) {
                this.notifyError(msg, "WASM module is not initialized!");
            }
            else if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not created! There is nothing to reconfigure!");
            }
            else {
                try {
                    const recognizers = this.getRecognizers(msg.recognizerHandles);
                    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                      @typescript-eslint/no-unsafe-member-access,
                                      @typescript-eslint/no-unsafe-call */
                    this.nativeRecognizerRunner.reconfigureRecognizers(recognizers, msg.allowMultipleResults);
                    /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                     @typescript-eslint/no-unsafe-member-access,
                                     @typescript-eslint/no-unsafe-call */
                    this.notifySuccess(msg);
                }
                catch (error) {
                    this.notifyError(msg, error);
                }
            }
        }
        processDeleteRecognizerRunner(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is already deleted!");
                return;
            }
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access */
                this.nativeRecognizerRunner.delete();
                this.nativeRecognizerRunner = null;
                this.notifySuccess(msg);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access */
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        processInvokeObject(msg) {
            try {
                const objectHandle = msg.objectHandle;
                const methodName = msg.methodName;
                const params = this.unwrapParameters(msg);
                const object = this.objects[objectHandle]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                if (object === undefined) {
                    this.notifyError(msg, "Cannot find object with handle: " + objectHandle.toString());
                }
                else {
                    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                      @typescript-eslint/no-unsafe-member-access,
                                      @typescript-eslint/no-unsafe-call */
                    const result = object[methodName](...params);
                    /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                    @typescript-eslint/no-unsafe-member-access,
                                    @typescript-eslint/no-unsafe-call */
                    const transferrables = this.scanForTransferrables(result);
                    if (methodName === "delete") {
                        delete this.objects[objectHandle];
                    }
                    this.context.postMessage(new InvokeResultMessage(msg.messageID, result), transferrables);
                }
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        processImage(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not initialized! Cannot process image!");
                return;
            }
            try {
                const image = msg.frame;
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-assignment */
                const result = this.nativeRecognizerRunner.processImage(image);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access,
                                 @typescript-eslint/no-unsafe-assignment */
                this.context.postMessage(new ImageProcessResultMessage(msg.messageID, result));
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        resetRecognizers(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not initialized! Cannot process image!");
                return;
            }
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access */
                this.nativeRecognizerRunner.resetRecognizers(msg.hardReset);
                this.notifySuccess(msg);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access */
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        setDetectionOnly(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not initialized! Cannot process image!");
                return;
            }
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access */
                this.nativeRecognizerRunner.setDetectionOnlyMode(msg.detectionOnlyMode);
                this.notifySuccess(msg);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access */
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        setCameraPreviewMirrored(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not initialized! Cannot process image!");
                return;
            }
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access */
                this.nativeRecognizerRunner.setCameraPreviewMirrored(msg.cameraPreviewMirrored);
                this.notifySuccess(msg);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access */
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        setupMetadataCallbacks(registeredMetadataCallbacks) {
            // setup local callbacks
            if (registeredMetadataCallbacks.onDebugText) {
                this.metadataCallbacks.onDebugText = (debugText) => {
                    const msg = new InvokeCallbackMessage(MetadataCallback.onDebugText, [debugText]);
                    this.context.postMessage(msg);
                };
            }
            else {
                delete this.metadataCallbacks.onDebugText;
            }
            if (registeredMetadataCallbacks.onDetectionFailed) {
                this.metadataCallbacks.onDetectionFailed = () => {
                    const msg = new InvokeCallbackMessage(MetadataCallback.onDetectionFailed, []);
                    this.context.postMessage(msg);
                };
            }
            else {
                delete this.metadataCallbacks.onDetectionFailed;
            }
            if (registeredMetadataCallbacks.onPointsDetection) {
                this.metadataCallbacks.onPointsDetection = (pointSet) => {
                    const onPointsDetection = MetadataCallback.onPointsDetection;
                    const msg = new InvokeCallbackMessage(onPointsDetection, [pointSet]);
                    this.context.postMessage(msg);
                };
            }
            else {
                delete this.metadataCallbacks.onPointsDetection;
            }
            if (registeredMetadataCallbacks.onQuadDetection) {
                this.metadataCallbacks.onQuadDetection = (quad) => {
                    const msg = new InvokeCallbackMessage(MetadataCallback.onQuadDetection, [quad]);
                    this.context.postMessage(msg);
                };
            }
            else {
                delete this.metadataCallbacks.onQuadDetection;
            }
            if (registeredMetadataCallbacks.onFirstSideResult) {
                this.metadataCallbacks.onFirstSideResult = () => {
                    const msg = new InvokeCallbackMessage(MetadataCallback.onFirstSideResult, []);
                    this.context.postMessage(msg);
                };
            }
            else {
                delete this.metadataCallbacks.onFirstSideResult;
            }
            if (registeredMetadataCallbacks.onGlare) {
                this.metadataCallbacks.onGlare = (hasGlare) => {
                    const msg = new InvokeCallbackMessage(MetadataCallback.onGlare, [hasGlare]);
                    this.context.postMessage(msg);
                };
            }
            else {
                delete this.metadataCallbacks.onGlare;
            }
        }
        registerMetadataCallbacks(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not initialized! Cannot process image!");
                return;
            }
            this.setupMetadataCallbacks(msg.registeredMetadataCallbacks);
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access */
                this.nativeRecognizerRunner.setJSDelegate(this.metadataCallbacks);
                this.notifySuccess(msg);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access */
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
        registerClearTimeoutCallback(msg) {
            if (this.nativeRecognizerRunner === null) {
                this.notifyError(msg, "Recognizer runner is not initialized! Cannot process image!");
                return;
            }
            if (msg.callbackNonEmpty) {
                this.clearTimeoutCallback = {
                    onClearTimeout: () => {
                        const clearTimeoutCallback = MetadataCallback.clearTimeoutCallback;
                        const msg = new InvokeCallbackMessage(clearTimeoutCallback, []);
                        this.context.postMessage(msg);
                    }
                };
            }
            else {
                this.clearTimeoutCallback = null;
            }
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-call,
                                  @typescript-eslint/no-unsafe-member-access */
                this.nativeRecognizerRunner.setClearTimeoutCallback(this.clearTimeoutCallback);
                this.notifySuccess(msg);
                /* eslint-enable @typescript-eslint/no-unsafe-call,
                                 @typescript-eslint/no-unsafe-member-access */
            }
            catch (error) {
                this.notifyError(msg, error);
            }
        }
    }

    new MicroblinkWorker();

}());
//# sourceMappingURL=BlinkIDWasmSDK.worker.js.map
