import {Response} from 'express';

export function response_header_template(res: Response) {
    // Content-Type: application/json is the most common header for JSON
    res.setHeader('Content-Type', 'application/json');
    // Access-Control-Allow-Origin: * allows requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Access-Control-Allow-Methods: GET, POST, PUT, DELETE allows these methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Access-Control-Allow-Headers: Content-Type, Authorization allows these headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Access-Control-Allow-Credentials: true allows credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Access-Control-Max-Age: 86400 allows preflight requests to be cached for 24 hours
    res.setHeader('Access-Control-Max-Age', '86400');

    return res;
}