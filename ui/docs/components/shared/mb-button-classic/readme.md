# mb-button-classic



<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute         | Description                                                                              | Type                    | Default     |
| --------------------------- | ----------------- | ---------------------------------------------------------------------------------------- | ----------------------- | ----------- |
| `clickHandler` _(required)_ | --                | Function to call on click                                                                | `(ev: UIEvent) => void` | `undefined` |
| `disabled`                  | `disabled`        | Set to 'true' if button should be disabled, and if click events should not be triggered. | `boolean`               | `false`     |
| `inverted`                  | `inverted`        | Set to 'true' if button should be inverted style.                                        | `boolean`               | `false`     |
| `preventDefault`            | `prevent-default` | Set to 'true' if default event should be prevented.                                      | `boolean`               | `false`     |


## Dependencies

### Used by

 - [mb-component](../mb-component)

### Graph
```mermaid
graph TD;
  mb-component --> mb-button-classic
  style mb-button-classic fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
