let doc_url = new URL(document.location.href);
let index = doc_url.searchParams.get('index');
let doc_id = doc_url.searchParams.get('id');


let last_time = 0;

const elOverflow = document.getElementsByClassName('content-overflow')[0];
const eps = 0.25;

function highlight_current_word() {
    let current_time = player.getCurrentTime();

    if (current_time === last_time) {
        return;
    }

    last_time = current_time;

    let current_segment = null;
    for (let seg of document.getElementsByClassName('segment')) {
        if (seg.getAttribute('s') <= current_time && seg.getAttribute('e') >= current_time) {
            current_segment = seg;
            break;
        }
    }

    if (current_segment && !current_segment.classList.contains('highlight')) {
        for (let seg of document.getElementsByClassName('segment highlight')) {
            seg.classList.remove('highlight');
            seg.querySelectorAll('.highlight').forEach((word) => {
                word.classList.remove('highlight');
            });
        }
        current_segment.classList.add('highlight');
        elOverflow.scrollTo({behavior: 'smooth', top: current_segment.offsetTop - elOverflow.offsetTop});
    }

    current_segment.querySelectorAll('.reco > w').forEach((word) => {
        if (word.getAttribute('s') <= current_time + eps && word.getAttribute('e') >= current_time - eps) {
            word.classList.add('highlight');
        } else {
            word.classList.remove('highlight');
        }
    });

    let hiTextS = -1, hiTextE = -1;
    current_segment.querySelectorAll('.norm > w').forEach((word) => {
        if (word.getAttribute('s') <= current_time + eps && word.getAttribute('e') >= current_time - eps) {
            word.classList.add('highlight');
            if (word.getAttribute('cs') < hiTextS || hiTextS === -1) {
                hiTextS = word.getAttribute('cs');
            }
            if (word.getAttribute('ce') > hiTextE || hiTextE === -1) {
                hiTextE = word.getAttribute('ce');
            }
        } else {
            word.classList.remove('highlight');
        }
    });

    let elText = current_segment.querySelector('.text');
    let oldText = elText.innerText;
    if (hiTextE > hiTextS) {
        elText.innerHTML = oldText.substring(0, hiTextS) + '<w class="highlight">' + oldText.substring(hiTextS, hiTextE) + '</w>' + oldText.substring(hiTextE);
    } else {
        elText.innerHTML = oldText;
    }

}

function playSegment(ev) {
    let elSeg = ev.target.parentElement.parentElement;
    player.seekTo(elSeg.getAttribute('s'));
    player.playVideo();
}

let remote_url = 'https://raw.githubusercontent.com/danijel3/parlaspeech-yt-viewer/main/';

async function render_page() {
    const response = await fetch(remote_url + "corpora/data/" + index + "/" + doc_id + ".json");
    const segments = await response.json();

    const elSegments = document.getElementById('segments');

    for (let seg of segments) {

        if (seg.match_error === 'only in reference')
            continue;

        let elSeg = document.createElement('div');

        let elToolbar = document.createElement('div');
        elToolbar.classList.add('segment-toolbar');
        elSeg.appendChild(elToolbar);

        let elPlay = document.createElement('button');
        elPlay.classList.add('segment-play');
        elPlay.innerHTML = '&#x25B6;';
        elPlay.onclick = playSegment;
        elToolbar.appendChild(elPlay);

        if (seg.text) {
            let elText = document.createElement('div');
            elText.innerText = seg.text;
            elText.classList.add('text');
            elSeg.appendChild(elText);
        }

        if (seg.norm) {

            let elNorm = document.createElement('div');

            seg.norm.split(' ').forEach((word, idx) => {
                let elWord = document.createElement('w');
                elWord.innerText = word;
                elWord.setAttribute('s', seg.words[idx]['time_s']);
                elWord.setAttribute('e', seg.words[idx]['time_e']);
                elWord.setAttribute('cs', seg.words[idx]['char_s']);
                elWord.setAttribute('ce', seg.words[idx]['char_e']);
                elNorm.appendChild(elWord);
            });


            elNorm.classList.add('norm');
            elNorm.classList.add('segment-line');
            elSeg.appendChild(elNorm);
        }

        if (seg.reco) {
            let elReco = document.createElement('div');
            seg.reco.split(' ').forEach((word, idx) => {
                let elWord = document.createElement('w');
                let times = seg.reco_words[idx];
                elWord.innerText = word;
                elWord.setAttribute('s', times['time_s']);
                elWord.setAttribute('e', times['time_e']);
                elReco.appendChild(elWord);
            });
            elReco.classList.add('reco');
            elReco.classList.add('segment-line');
            elSeg.appendChild(elReco);

            elSeg.setAttribute('s', seg.reco_words[0]['time_s']);
            elSeg.setAttribute('e', seg.reco_words[seg.reco_words.length - 1]['time_e']);
        }

        elSeg.classList.add('segment');
        elSegments.appendChild(elSeg);
    }

    setInterval(highlight_current_word, 300);
}

render_page();

let tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '220',
        width: '360',
        videoId: doc_id,
        playerVars: {
            'playsinline': 1
        },
        events: {}
    });
}
