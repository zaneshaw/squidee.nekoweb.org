let bgm;

function applySettings(settings) {
	bgm?.mute(!settings["bgm"]);
	document.getElementById("bgm-mute-icon").innerText = settings["bgm"] ? "🔊" : "🔇";

	document.getElementById("squid").style.visibility = settings["squid"] ? "visible" : "hidden";
	squidCheckbox.innerText = settings["squid"] ? "hide squid" : "show squid";
}

function saveSettings(settings) {
	window.localStorage.setItem("settings", JSON.stringify(settings));
}

const defaultSettings = {
	bgm: true,
	squid: true,
};
let settings = {};
const settingsLS = window.localStorage.getItem("settings");
if (settingsLS == null) {
	settings = defaultSettings;
} else {
	settings = { ...defaultSettings, ...JSON.parse(settingsLS) };
}
saveSettings(settings);

const squidCheckbox = document.getElementById("squid-toggle");

squidCheckbox.addEventListener("click", () => {
	settings["squid"] = !settings["squid"];
	applySettings(settings);
	saveSettings(settings);
});

applySettings(settings);

const sleepRange = [300, 600];
const squidEl = document.getElementById("squid");
let squid = {
	posX: 0,
	posY: 0,
	velocityX: 0,
	velocityY: 0,
	sleeping: true,
	sleepTimer: Math.floor(Math.random() * (sleepRange[1] - sleepRange[0]) + sleepRange[1]),
	slow: false,
};

const squidLocalStorage = window.localStorage.getItem("squid");
if (squidLocalStorage != null) {
	squid = JSON.parse(squidLocalStorage);
}

window.addEventListener("beforeunload", function () {
	window.localStorage.setItem("squid", JSON.stringify(squid));

	window.sessionStorage.setItem("bgm_seek", bgm?.seek() ?? 0);
});

// rewrite at some point
function processSquid() {
	if (squid.sleeping && squid.sleepTimer <= 0) {
		squid.sleeping = false;
		squid.posX = window.innerWidth - 150;
		squid.posY = 100;
		squid.velocityX = 5;
		squid.velocityY = -1;
	}

	if (squid.sleeping) {
		squid.sleepTimer--;
	} else {
		if (squid.velocityY > 1) {
			squidEl.style.backgroundPositionX = "300px";
		} else {
			if (squid.posY < 105) {
				squidEl.style.backgroundPositionX = "600px";
				squid.slow = true;
			} else {
				squidEl.style.backgroundPositionX = "0px";
			}
		}

		if (squid.posY < 100) {
			squid.velocityX = 8;
			squid.velocityY = 5;
			squid.slow = false;
		}

		squid.posX -= squid.velocityX;
		squid.posY += squid.velocityY;
		squid.velocityX -= 0.15;
		squid.velocityY -= 0.3;
		if (squid.slow) {
			if (squid.velocityX < 1) squid.velocityX = 1;
			if (squid.velocityY < -0.3) squid.velocityY = -0.3;
		} else {
			if (squid.velocityX < 3) squid.velocityX = 3;
			if (squid.velocityY < -1) squid.velocityY = -1;
		}

		if (squid.posX < -300) {
			squid.sleeping = true;
			squid.sleepTimer = Math.floor(Math.random() * (sleepRange[1] - sleepRange[0]) + sleepRange[1]);
		}
	}

	squidEl.style.left = `${squid.posX}px`;
	squidEl.style.bottom = `${squid.posY}px`;
	squidEl.style.display = squid.sleeping ? "none" : "block";
}

setInterval(processSquid, 40);

const bgmToggle = document.getElementById("bgm-toggle");
const bgmVolume = 0.015;
const bgmTracks = [
	{ name: "波", path: "/assets/sounds/波_16k.opus" },
	{ name: "aqua alaganza", path: "/assets/sounds/aqua_alaganza_16k.opus" },
	{ name: "公衆 pool", path: "/assets/sounds/公衆_pool_16k.opus" },
	{ name: "thirdeye.wave", path: "/assets/sounds/thirdeye.wave_16k.opus" },
];
const bgmIndex = new Date().getDate() % bgmTracks.length;
document.querySelector("#bgm-name").innerText = bgmTracks[bgmIndex].name;

window.addEventListener("load", () => {
	let bgmSeek = window.sessionStorage.getItem("bgm_seek");
	if (bgmIndex != window.sessionStorage.getItem("bgm_index")) {
		bgmSeek = 0;
		window.sessionStorage.setItem("bgm_seek", 0);
	}
	window.sessionStorage.setItem("bgm_index", bgmIndex);

	bgm = new Howl({
		src: [bgmTracks[bgmIndex].path],
		preload: true,
		loop: true,
		volume: bgmVolume,
		mute: !settings["bgm"],
	});
	bgm.seek(bgmSeek ?? 0);
	bgm.play();
	bgm.fade(0, bgmVolume, 2000);

	bgmToggle.addEventListener("click", () => {
		settings["bgm"] = !settings["bgm"];

		applySettings(settings);
		saveSettings(settings);
	});

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			bgm.fade(bgm.volume(), 0, 500);
		} else {
			bgm.fade(bgm.volume(), bgmVolume, 500);
		}
	});
});

function notifyOutdated() {
	console.error("you're seeing an outdated version of the website. press ctrl+shift+r to update.");

	document.body.innerHTML += `<div class="container" id="outdated-notification">
		<img src="/assets/images/warning.png" />
		<div>
			<p>you're seeing an outdated version of the website! press <b>ctrl+shift+r</b> to update</p>
			<p>(you might need to do this for every page you visit)</p>
		</div>
	</div>`;
}

function checkVersion() {
	fetch("/version").then(async (res) => {
		const version = (await res.text()).trim();

		if (version != "dev") {
			fetch("https://api.github.com/repos/zaneshaw/squidee.nekoweb.org/actions/workflows/deploy.yaml/runs?per_page=1").then(async (res) => {
				const ghJson = await res.json();
				const ghVersion = `${ghJson.workflow_runs[0].id}${ghJson.workflow_runs[0].run_attempt}`;

				if (version != ghVersion) notifyOutdated();
			});
		}
	});
}

checkVersion();
