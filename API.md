## Classes

* [plot](#plot)
    * [new plot(data, products, options)](#new_plot_new)

## Typedefs

* [PlottedCanvases](#PlottedCanvases)
* [PlottedCanvas](#PlottedCanvas)

<a name="plot"></a>

## plot
**Kind**: global class  
<a name="new_plot_new"></a>

### new plot(data, products, options)
Plot level 2 data

**Returns**: [<code>Array.&lt;PlottedCanvases&gt;</code>](#PlottedCanvases) - Plotted canvases in the order they are requested by the input options.elevations  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Level2Data</code> |  | *Output from the [nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data) library |
| products | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Individual strings as shown in supported products to specify the products to be plotted. |
| options | <code>object</code> |  | Plotting options |
| [options.size] | <code>number</code> | <code>3600</code> | 1 to 3600. 1 to 3600. Size of the x and y axis in pixels. The image must be square so only a single integer is needed. |
| [options.cropTo] | <code>number</code> | <code>3600</code> | 1 to 3600. After scaling and downsampling as described above crop the resulting plot to the size specified. Internally, the image is actually drawn at the cropped size to save on processing time. |
| [options.background] | <code>string</code> | <code>&quot;#000000&quot;</code> | Background color of the image. This can be transparent by using #RGBA notation. See [ctx.fillStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle) for more information. |
| [options.lineWidth] | <code>number</code> | <code>2</code> | The raster image is created by drawing several arcs at the locations and colors specified in the data file. When scaling down you may get a better looking image by adjusting this value to something large than the default. |
| [options.palettize] | <code>boolean</code> \| <code>object</code> |  | After drawing the image convert the image from RGBA to a palettized image. When true the same palette as the product is used. Additional options are described in [palettizing](#palettizing). This can significantly reduce the size of the resulting image with minimal loss of clarity. |
| [options.elevations] | <code>undefined</code> \| <code>number</code> \| <code>Array.&lt;number&gt;</code> |  | The specific elevations to plot. If undefined (default) all available elevations will be plotted. If an integer is provided a single elevation will be plotted with all the selected ```products```. If an array of integers are provided each ```products``` in each elevation will be plotted. Note that when a product and elevation combination do not exist the returned object will have false in the missing location. This is common where elevation 1 will have reflectivity data and elevation 2 (altough at the same angle as elevation 1) will contain velocity data. |
| [options.usePreferredWaveforms] | <code>boolean</code> | <code>true</code> | Waveform types of 1, 2, 3, 4 and 5 are produced by the radar. Type 1 is typically exclusive to reflectivity, Type 2 is typically exclusive to velocity however it also produces reflectivity data. Types 3, 4 and 5 all produce both velocity and reflectivity. When set to true type 1 waveforms will not plot velocity data, and type 2 waveforms will not plot reflectivity data. If you must see all information set this to false. |

<a name="PlottedCanvases"></a>

## PlottedCanvases
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elevation | <code>number</code> | Elevation number |
| [REF] | [<code>PlottedCanvas</code>](#PlottedCanvas) | Reflectivity |
| [VEL] | [<code>PlottedCanvas</code>](#PlottedCanvas) | Velocity |

<a name="PlottedCanvas"></a>

## PlottedCanvas
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| canvas | <code>Canvas</code> | *[canvas](https://www.npmjs.com/package/canvas) contains the plotted data and functions for outputtting various image formats. |
| palette | <code>Uint8ClampedArray</code> | Array that can be used to create palettized images from the Canvas library. |

