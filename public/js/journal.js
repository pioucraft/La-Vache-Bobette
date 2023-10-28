function partager() {
    let phrase = document.getElementsByTagName("h1")[1].innerHTML
    if (navigator.share) {
        navigator.share({
          title: document.title,
          text: phrase,
          url: window.location.href
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing:', error));
    
    }
    else {
        twitter()
    }
}

function twitter() {
    let phrase = document.getElementsByTagName("h1")[1].innerHTML
    window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${phrase}`)
}