# CDN Vault

Welcome to **CDN Vault**! This is a simple, personal server for storing and managing your images and files. Think of it like your own private cloud storage where you can easily upload files and get links to share them anywhere.

It is built using **Next.js** and uses **Vercel Blob** to store your files securely.

---

## 🚀 Features

- **Personal Dashboard:** A clean, easy-to-use webpage where you can see all the files you've uploaded.
- **Upload API:** Upload files directly from other apps, scripts, or the command line using a secret key.
- **Delete API:** Remove files you no longer need.
- **Fast and Secure:** Hosted on Vercel, meaning your files load fast and are kept safe.

---

## 🛠️ How to Set It Up

To run this project, you will need a few things set up in your environment. Create a `.env.local` file in the root folder (or add these to your Vercel project settings if deploying):

```env
# Your Vercel Blob Token (You get this by creating a Blob store in your Vercel project)
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"

# A secret password you choose. You will use this to authorize your uploads and deletes!
CDN_SECRET_KEY="your_super_secret_password"
```

### Running Locally

1. Install the dependencies:
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or yarn dev / pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see your Dashboard!

---

## 🌐 How to Use the API

You can upload and delete files programmatically using the built-in API. Make sure to pass your `CDN_SECRET_KEY` in the Authorization header!

### 1. Upload a File
Send a `POST` request to `/api/upload` with your file. You can also specify the filename in the URL.

**Example using cURL:**
```bash
curl -X POST "http://localhost:3000/api/upload?filename=my-awesome-pic.png" \
  -H "Authorization: Bearer your_super_secret_password" \
  --data-binary "@path/to/your/local/image.png"
```
*This will return a link to your uploaded file!*

### 2. Delete a File
Send a `DELETE` request to `/api/delete` and provide the URL of the file you want to delete.

**Example using cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/delete?url=https://your-vercel-blob-url.com/my-awesome-pic.png" \
  -H "Authorization: Bearer your_super_secret_password"
```

---

## 🚀 Deployment

The easiest way to deploy your CDN Vault is to use [Vercel](https://vercel.com/new).
1. Push this code to your GitHub.
2. Import the project in Vercel.
3. Add your `CDN_SECRET_KEY` and set up the Vercel Blob storage in your project settings to automatically get the `BLOB_READ_WRITE_TOKEN`.
4. Deploy!
