let doc_url = new URL(document.location.href);
let index = doc_url.searchParams.get('index');

let remote_url = 'https://raw.githubusercontent.com/danijel3/parlaspeech-yt-viewer/main/';

let datatable = new DataTable('#utterances', {
    'ajax': remote_url + 'corpora/index/' + index + '.json',
    columns: [
        {data: 'name', title: 'Name'},
        {
            data: 'yt_id',
            title: 'YouTube ID',
            render: function (data, type, row, meta) {
                return '<a href="view.html?index=' + index + '&id=' + data + '">' + data + '</a>';
            }
        },
        {data: 'date', title: 'Date'},
        {data: 'ref_only_seg', title: 'Segs only in ref'},
        {data: 'ref_only_words', title: 'Words only in ref'},
        {data: 'reco_only_seg', title: 'Segs only in reco'},
        {data: 'reco_only_words', title: 'Words only in reco'},
        {data: 'ok_match_seg', title: 'Segs matched'},
        {data: 'ok_match_words', title: 'Words matched'},
        {data: 'coverage', title: 'Coverage'},
        {data: 'overall_wer', title: 'Overall WER'}
    ],
    'order': [[2, 'desc']],
});


