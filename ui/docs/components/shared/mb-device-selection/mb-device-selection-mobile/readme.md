# mb-device-selection-mobile



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute | Description | Type         | Default     |
| ------------ | --------- | ----------- | ------------ | ----------- |
| `d2dOptions` | --        |             | `D2DOptions` | `undefined` |


## Events

| Event  | Description | Type                |
| ------ | ----------- | ------------------- |
| `init` |             | `CustomEvent<void>` |


## Dependencies

### Used by

 - [mb-component](../../mb-component)

### Depends on

- [mb-spinner](../../mb-spinner)
- [mb-device-selection-quit](../mb-device-selection-quit)
- [mb-button-classic](../../mb-button-classic)

### Graph
```mermaid
graph TD;
  mb-device-selection-mobile --> mb-spinner
  mb-device-selection-mobile --> mb-device-selection-quit
  mb-device-selection-mobile --> mb-button-classic
  mb-device-selection-quit --> mb-overlay
  mb-device-selection-quit --> mb-modal
  mb-device-selection-quit --> mb-button-classic
  mb-component --> mb-device-selection-mobile
  style mb-device-selection-mobile fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
