// Create advanced options list
const divGenres = document.querySelector('#genres')
axios.get("https://api.rawg.io/api/genres").then(res=>{
    // console.log(res.data)
    for(let i of res.data.results){
        const input = document.createElement('input')
        input.classList.add('genresOpt')
        input.type = 'checkbox'
        input.id = i.slug
        input.name = 'genres' 
        input.value = i.id

        const label = document.createElement('label')
        label.htmlFor = i.slug
        label.innerText = i.name
        
        divGenres.appendChild(input)
        divGenres.appendChild(label)
    }
})
const divPlatforms = document.querySelector('#platforms')
axios.get("https://api.rawg.io/api/platforms").then(res=>{
    // console.log(res.data)
    for(let i of res.data.results){
        const input = document.createElement('input')
        input.classList.add('platformsOpt')
        input.type = 'checkbox'
        input.id = i.slug
        input.name = 'platforms' 
        input.value = i.id

        const label = document.createElement('label')
        label.htmlFor = i.slug
        label.innerText = i.name
        
        divPlatforms.appendChild(input)
        divPlatforms.appendChild(label)
    }
})

$('#btnOption').click(()=>{
    $('#btnOption i').toggleClass("fa-plus-square")
    $('#btnOption i').toggleClass("fa-minus-square")
    $('#options').slideToggle()
})

const btnSubmit = document.querySelector('button[type="submit"]')
const inputSearch = document.querySelector('input[type="search"]')
const ul = document.querySelector('#cards')
let loading = false;

const form = document.querySelector('#searchForm')
form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if(loading) return;
    else loading = true

    btnSubmit.disabled = true;
    inputSearch.disabled = true;
    $('.startSearching').fadeOut()
    $('.noResult').fadeOut()
    $('.la-pacman').fadeIn()

    ul.innerText = ''

    const orderingValue = document.querySelector('.orderingOpt:checked').value
    const genresValue = [...document.querySelectorAll('.genresOpt:checked')]
        .map(x => x.value).join()
    const platformsValue = [...document.querySelectorAll('.platformsOpt:checked')]
        .map(x => x.value).join()
    // console.log("genresValue",genresValue,"platformsValue", platformsValue
    // , "orderingValue",orderingValue)

    const keyword = form.elements.query.value
    const key = 'e00e38fa04034733af7215cb5e5ee9e7'
    const config = { 
        params: {
            key: key,
            search: keyword,
            search_precise: true,
            // search_exact: true,
            page_size: 6
        }}
    if(genresValue) config.params.genres = genresValue
    if(platformsValue) config.params.platforms = platformsValue
    if(orderingValue) config.params.ordering = orderingValue

    try{
        const results = await axios.get(`https://api.rawg.io/api/games`, config)
        // console.log(results.data)
        if(results.data.count!=0){
            for(let res of results.data.results){
                const resDetail = await axios.get(`https://api.rawg.io/api/games/${res.id}`)
                // console.log(resDetail.data)
                $('.la-pacman').fadeOut()
                displayCard(resDetail.data)
            }
        }
        else{
            $('.la-pacman').fadeOut()
            $('.noResult').fadeIn()
        }
    } catch(e){
        console.log(e)
    }
    
    btnSubmit.disabled = false;
    inputSearch.disabled = false;
    loading = false;
})

const displayCard = (res) => {

    const ul = document.querySelector('#cards')
    const li = document.createElement('li')
    li.classList.add("card")

    // div.mainContain
    const divMainContain = document.createElement('div')
    divMainContain.classList.add("mainContain")

    // div.img
    const divImg = document.createElement('div')
    divImg.classList.add("img")
    if(res.background_image!=null){
        divImg.style.backgroundImage = `url('${res.background_image}')`
    }
    // div.contain
    const divContain = document.createElement('div')
    divContain.classList.add("contain")

    // title & tag
    const title = document.createElement('h3')
    title.innerText = res.name
    const ulTag = document.createElement('ul')
    ulTag.classList.add('tag')
    for(let tag of res.genres){
        const liTag = document.createElement('li')
        liTag.innerText = tag.name
        ulTag.appendChild(liTag)
    }
    
    // info
    const ulInfo = document.createElement('ul')
    ulInfo.classList.add('info')
    const liDate = document.createElement('li')
    liDate.innerHTML = `<b>Released Date</b> :  ${res.released}`
    ulInfo.appendChild(liDate)
    const liPlat = document.createElement('li')
    liPlat.innerHTML = `<b>Platform</b> :  `
    for(let i=0; i<res.platforms.length; i++){
        liPlat.innerHTML += res.platforms[i].platform.name
        if(i!=res.platforms.length-1) liPlat.innerHTML += ', '
    }
    ulInfo.appendChild(liPlat)
    const liDev = document.createElement('li')
    liDev.innerHTML = `<b>Developer</b> :  `
    for(let i=0; i<res.developers.length; i++){
        liDev.innerHTML += res.developers[i].name
        if(i!=res.developers.length-1) liDev.innerHTML += ', '
    }
    ulInfo.appendChild(liDev)
    const liRate = document.createElement('li')
    if(res.rating)
        liRate.innerHTML = `<b>Rating</b> :  ${res.rating}/5`
    else
        liRate.innerHTML = `<b>Rating</b> :  -`
    ulInfo.appendChild(liRate)

    divContain.appendChild(title)
    divContain.appendChild(ulTag)
    divContain.appendChild(ulInfo)
    divMainContain.appendChild(divImg)
    divMainContain.appendChild(divContain)

    // div.desContain
    const divDesContain = document.createElement('div')
    divDesContain.classList.add('desContain')
    const description = document.createElement('div')
    description.classList.add('description','collapse')
    // <p>會使 text-overflow: ellipsis 產生問題
    let resDes = res.description
        .replaceAll('<p>', '<br>').replaceAll('</p>', '<br>')
    if(resDes.startsWith('<br>')) resDes = resDes.slice(4)
    description.innerHTML = resDes
    
    // see more
    const seeMore = document.createElement('div')
    seeMore.classList.add('seeMore', 'more')
    seeMore.innerHTML = '<i class="fas fa-angle-double-down"></i>&ensp;&ensp;<b>See More</b>'
    divDesContain.addEventListener('click',()=>{
        if(seeMore.classList.contains('more')){
            // 展開description
            const top = document.scrollingElement.scrollTop;
            seeMore.classList.remove('more');
            seeMore.innerHTML = '<i class="fas fa-angle-double-up"></i>&ensp;&ensp;<b>See Less</b>'
            description.classList.remove('collapse')
            document.scrollingElement.scrollTop = top
        }
        else{
            seeMore.classList.add('more');
            seeMore.innerHTML = '<i class="fas fa-angle-double-down"></i>&ensp;&ensp;<b>See More</b>'
            description.classList.add('collapse')
        }
    })
    divDesContain.appendChild(description)
    divDesContain.appendChild(seeMore)

    li.appendChild(divMainContain)
    li.appendChild(divDesContain)
    ul.appendChild(li)

    // 沒有overflow時 隱藏see more
    if(description.scrollHeight===description.clientHeight)
        seeMore.style.display = "none";

    window.addEventListener('resize', ()=>{
        if(description.scrollHeight===description.clientHeight && seeMore.classList.contains('more'))
            seeMore.style.display = "none";    
        else
            seeMore.style.display = "block"; 
    })

}

// To-Top Btn
$('.toTop').click(()=>{
    $('html,body').animate({ scrollTop: 0 }, 'slow')
})
$(window).scroll(()=>{
    if($(this).scrollTop() > 20){
        $('.toTop').fadeIn();
    }
    else{
        $('.toTop').fadeOut();
    }
})