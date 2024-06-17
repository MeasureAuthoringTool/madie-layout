
import axios from 'axios';
import DOMPurify from 'dompurify';


axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Check for WAF block
      if (
        error?.response?.status === 403 &&
        error?.response?.headers["content-type"].includes("text/html") &&
        JSON.stringify(error.response.data).includes("soc@hcqis.org")
      ) {
        // eslint-disable-next-line no-console
        console.log("WAF Interceptor Triggered");
        
        const supportID = error.response.data.includes("ID:")?
        error.response.data
          .split("ID:")[1]
          .split("<br>")[0]
          .trim():"";
        const body = error.response.data.split("<body>")[1].split("<br>")[0];
        throw new Error(DOMPurify.sanitize(body, { ALLOWED_TAGS: [] })); // no tags allowed, removes all HTML tags.
      }
      return Promise.reject(error);
    }
  );