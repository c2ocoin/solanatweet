import dayjs from "dayjs"
export class Tweet
{
    //Dados Da Classe Tweet;
    constructor (publicKey, accountData) {
        this.publicKey = publicKey
        this.author = accountData.author
        this.timestamp = accountData.timestamp.toString()
        this.topic = accountData.topic
        this.content = accountData.content
    }
    //Aqui Pega A Chave;
    get key () {
        return this.publicKey.toBase58()
    }

    //Aqui Pega A Chave Do Autor E Exibe Os 4 Primeiros E Os 4 Ultimos Caracters;
    get author_display () {
        const author = this.author.toBase58()
        return author.slice(0,4) + '..' + author.slice(-4)
    }
    get created_at () {
        return dayjs.unix(this.timestamp).format('lll')
    }

    get created_ago () {
        return dayjs.unix(this.timestamp).fromNow()
    }
}