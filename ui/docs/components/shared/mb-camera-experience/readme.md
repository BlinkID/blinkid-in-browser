# mb-camera-experience



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute      | Description                                                                                                                                                 | Type                                                                                           | Default     |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- |
| `showOverlay`        | `show-overlay` | Unless specifically granted by your license key, you are not allowed to modify or remove the Microblink logo displayed on the bottom of the camera overlay. | `boolean`                                                                                      | `true`      |
| `translationService` | --             | Instance of TranslationService passed from root component.                                                                                                  | `TranslationService`                                                                           | `undefined` |
| `type`               | `type`         | Choose desired camera experience.  Each experience type must be implemented in this component.                                                              | `CameraExperience.Barcode \| CameraExperience.CardCombined \| CameraExperience.CardSingleSide` | `undefined` |


## Events

| Event   | Description                             | Type                |
| ------- | --------------------------------------- | ------------------- |
| `close` | Emitted when user clicks on 'X' button. | `CustomEvent<void>` |


## Methods

### `setState(state: CameraExperienceState, isBackSide?: boolean, force?: boolean) => Promise<void>`

Set camera scanning state.

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [mb-component](../mb-component)

### Graph
```mermaid
graph TD;
  mb-component --> mb-camera-experience
  style mb-camera-experience fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
