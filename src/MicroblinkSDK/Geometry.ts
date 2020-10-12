/**
 * Interface representing a point in image.
 */
export interface Point
{
    /** X-coordinate of the point */
    x: number

    /** Y-coordinate of the point */
    y: number
}

/**
 * Interface representing a quadrilateral
 */
export interface Quadrilateral
{
    /** Top-left point of the quadrilateral */
    topLeft: Point

    /** Top-right point of the quadrilateral */
    topRight: Point

    /** Bottom-left point of the quadrilateral */
    bottomLeft: Point

    /** Bottom-right point of the quadrilateral */
    bottomRight: Point
}
