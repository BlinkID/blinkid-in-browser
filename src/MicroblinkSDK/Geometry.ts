/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

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

export interface Rectangle
{
    /** Top-left point of the rectangle */
    topLeft: Point

    /** Bottom-right point of the rectangle */
    bottomRight: Point
}

