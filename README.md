# MA-MPPI supplementary video

This is the anonymous, static landing page for six MA-MPPI supplementary videos.

## If you do not have a neutral GitHub account

The simplest route is to use [Anonymous GitHub](https://anonymous.4open.science/). First enable GitHub Pages for the source repository (Settings → Pages → deploy `main`/root), then sign in to Anonymous GitHub with your existing GitHub account, paste the repository URL, and create a read-only mirror with a random ID (for example, `paper-7f2a`). Turn **Keep links** off, enable **GitHub Pages**, choose **Remove when expired**, and share only the resulting `anonymous.4open.science/r/...` URL. Reviewers do not see the source owner or repository name in that mirror. The service itself can still associate the operation with your GitHub account, so this protects reviewer-facing anonymity rather than anonymity from the hosting service. Test the MP4 through the generated Pages URL before submitting; the service's file viewer documents text, images, PDFs, and notebooks, while the video should be served by the mirrored Pages site.

If the video is too large for the mirror, use Netlify Drop as a short-lived fallback: drag the prepared folder to <https://app.netlify.com/drop> without signing in and share the generated `netlify.app` URL together with its temporary password. Netlify documents that unsigned drops are password-protected until claimed; this is convenient for a review window but less durable, and their browser drop guide recommends keeping deployments small (under roughly 50 MB, with individual files over 10 MB potentially problematic).

For a persistent URL without a GitHub repository, Cloudflare Pages Direct Upload is another option using an existing Cloudflare account. Create a project named `ma-mppi-supplementary`, drag in the folder, and share the resulting `<project>.pages.dev` URL. Direct Upload has a 25 MiB per-file limit, so this only works when the compressed video is below that limit.

## Before submitting a double-blind link

1. Publish this page from a neutral repository/account. An existing repository URL or commit history tied to an author cannot be made anonymous by changing HTML alone.
2. Keep the repository limited to `index.html` and the six neutral video assets (`video_1.mp4` through `video_6.mp4`). Do not include author names, affiliations, personal links, ORCID IDs, analytics, badges, or tracking scripts.
3. The six videos are encoded as browser-compatible H.264/AAC MP4 files and use neutral filenames. If you replace an asset, keep the same filename or update the corresponding `<source>` path in `index.html`.
4. Remove identifying MP4 metadata before upload. With FFmpeg:

   ```bash
   ffmpeg -i input.mp4 -map_metadata -1 -map_chapters -1 -c copy supplementary_video.mp4
   ```

5. Check the deployed page in a private window and search the repository, page source, video metadata, commit history, and hosting URL for names, usernames, email addresses, and institution names.
