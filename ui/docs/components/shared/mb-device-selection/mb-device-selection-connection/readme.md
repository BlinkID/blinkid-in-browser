# mb-device-selection-connection



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type     | Default     |
| --------- | --------- | ----------- | -------- | ----------- |
| `variant` | `variant` |             | `string` | `undefined` |


## Events

| Event   | Description | Type                |
| ------- | ----------- | ------------------- |
| `close` |             | `CustomEvent<void>` |


## Dependencies

### Used by

 - [mb-device-selection](..)

### Depends on

- [mb-spinner](../../mb-spinner)
- [mb-button-classic](../../mb-button-classic)

### Graph
```mermaid
graph TD;
  mb-device-selection-connection --> mb-spinner
  mb-device-selection-connection --> mb-button-classic
  mb-device-selection --> mb-device-selection-connection
  style mb-device-selection-connection fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
