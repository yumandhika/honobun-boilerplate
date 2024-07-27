import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { successMessageResponse, successResponse } from "../utils/helpers";
import axios from "axios";
import { envConfig } from "../config/config";


export const uploadImage = async (c: Context): Promise<Response> => {
  try {
    const body = await c.req.parseBody()
    const file = body['file'];
       
    if (!file) {
      throw new HTTPException(400, { message: 'File is required' });
    }

    const imgurClientId = envConfig.imgur.client_id;
    const imgurApiUrl = envConfig.imgur.url;

    if (!imgurApiUrl) {
      throw new HTTPException(400, { message: 'Imgur api not found' }); 
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(imgurApiUrl, formData, {
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      c.status(201);
      return successResponse(c, { link: response.data.data.link });
    } else {
      throw new HTTPException(500, { message: 'Failed to upload image to Imgur' });
    }

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error create order',
      cause: err
    });
  }
}