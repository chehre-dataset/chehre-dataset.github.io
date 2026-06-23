const S3_BASE = "https://chehre-storage.s3.us-east-2.amazonaws.com";

const VIDEO_BASE = `${S3_BASE}/videos_anonymized`;
const PLOT_BASE = `${S3_BASE}/chehre_website/plots/2111_videos`;
const EMOJI_BASE = `${S3_BASE}/chehre_website/emojis`;

const DATA_JSON = "resrc/emoji_videos_plots_random10.json";
const SAMPLES_TO_SHOW = 4;

function buildUrl(base, filename) {
  return `${base.replace(/\/$/, "")}/${encodeURIComponent(filename)}`;
}

function plotFilenameFromVideo(videoFilename) {
  return `rank_counts__${videoFilename}.png`;
}

function displayVideoName(videoFilename) {
  return videoFilename.replace(/\.mp4$/i, "");
}

function pickRandomSamples(samples, count = SAMPLES_TO_SHOW) {
  const pool = [...samples];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function renderEmojiButtons(groups) {
  const container = document.getElementById("emojiButtons");

  container.innerHTML = groups
    .map((group, index) => {
      const activeClass = index === 0 ? "active" : "";
      const emojiUrl = group.emoji_path
        ? buildUrl(EMOJI_BASE, group.emoji_path)
        : null;
      const emojiContent = emojiUrl
        ? `<img class="emoji-img" src="${emojiUrl}" alt="${group.emoji_code || "emoji"}">`
        : `<span class="emoji-char">${group.emoji_code || "?"}</span>`;

      return `
        <button class="emoji-button ${activeClass}" data-index="${index}">
          ${emojiContent}
          <span class="emoji-label">${group.emoji_code || ""}</span>
        </button>
      `;
    })
    .join("");

  container.querySelectorAll(".emoji-button").forEach((button) => {
    button.addEventListener("click", () => {
      container
        .querySelectorAll(".emoji-button")
        .forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      const index = Number(button.dataset.index);
      renderSamples(groups[index]);
    });
  });
}

function renderSamples(group) {
  const grid = document.getElementById("sampleGrid");

  const samples = pickRandomSamples(group.samples || []);

  grid.innerHTML = samples
    .map((sample) => {
      const videoFilename = sample.video;
      const videoUrl = buildUrl(VIDEO_BASE, videoFilename);

      return `
        <article class="sample-card">
          <video controls autoplay muted loop playsinline preload="metadata">
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </article>
      `;
    })
    .join("");
}

async function initDatasetBrowser() {
  try {
    const response = await fetch(DATA_JSON);

    if (!response.ok) {
      throw new Error(`Could not load ${DATA_JSON}`);
    }

    const groups = await response.json();

    if (!Array.isArray(groups) || groups.length === 0) {
      throw new Error("JSON file is empty or not an array.");
    }

    renderEmojiButtons(groups);
    renderSamples(groups[0]);
  } catch (error) {
    console.error(error);
    document.getElementById("sampleGrid").innerHTML =
      "<p>Could not load dataset samples.</p>";
  }
}

initDatasetBrowser();