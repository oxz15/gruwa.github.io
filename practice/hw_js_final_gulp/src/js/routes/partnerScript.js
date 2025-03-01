'use strict';
//Server start
let $ServerData =
{
id: 100,
data: [
        {
        id: 104,
        name: "Bradley",
        surname: "Hunter",
        photo: 'img/partners--hunter__mobile.png',
        info: "Based in Chicago. I love playing tennis and loud music.",
        colorIcon: '4e73db',
        icon: 'partners--airplane'
        },
        {
        id: 102,
        name: "Lucas",
        surname: "Marsha",
        photo: 'img/partners--marsha__mobile.png',
        info: "I get my inspiration from nature and objects around me. I have a passion to colours, typography and skateboards.",
        colorIcon: 'ffa507',
        icon: 'partners--flask'
        },
        {
        id: 103,
        name: "Heather",
        surname: "Walker",
        photo: 'img/partners--walker__mobile.png',
        info: "I'm a happy person that loves cats and climbing on mountains.",
        colorIcon: '1cd7ad',
        icon: 'partners--cup'
        },
        {
        id: 101,
        name: "Gogas",
        surname: "Hunter",
        photo: 'img/partners--hunter2__mobile.png',
        info: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore ",
        colorIcon: 'ff4e50',
        icon: 'partners--tv'
        }
    ]
};
let $serverData = JSON.stringify($ServerData);
//Server end

let $jsData = JSON.parse($serverData);
let $html = $templateScript;
let $dataTmpl = {
    $data: $jsData
}
let $content = tmpl($html, $dataTmpl)

$('#partners--template__in').html('')
$('#partners--template__in').append($content)
