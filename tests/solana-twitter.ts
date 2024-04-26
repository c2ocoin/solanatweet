import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as assert from "assert";
import * as bs58 from "bs58";

// Aqui executa a `pub mod solana_twitter`.
describe("solana-twitter", () => {
  // Configure o cliente para usar o cluster local.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;

/*
  it('can send a new tweet', async () => {
    // Call the "SendTweet" instruction.
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('veganism', 'Hummus, am I right?', {
      accounts: {
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    });

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    console.log(tweetAccount);
  });*/

  //Editado em 23/04/2024 Matheus 
  it('can send a new tweet', async () => {
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('veganism', 'Hummus, am I right?', {
      accounts: {
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    });
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    assert.equal(tweetAccount.author.toBase58(), program.provider.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'veganism');
    assert.equal(tweetAccount.content, 'Hummus, am I right?');
    assert.ok(tweetAccount.timestamp);
  });

  it("Pode Mandar Um Novo Tweet!", async () => {
    // Chame a instrução "SendTweet".
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet(
      "The Blessing",
      "May His Presence Be With You",
      {
        accounts: {
          tweet: tweet.publicKey,
          author: program.provider.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [tweet],
      }
    );

    // Busque os detalhes da conta do tweet criado.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    assert.equal(
      tweetAccount.author.toBase58(),
      program.provider.publicKey.toBase58()
    );
    assert.equal(tweetAccount.topic, "The Blessing");
    assert.equal(tweetAccount.content, "May His Presence Be With You");
    assert.ok(tweetAccount.timestamp);
  });

  it("Pode Enviar Com 2 Autores", async () => {
    // Gere outro usuário e faça um airdrop para eles.
    const otherUser = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(
      otherUser.publicKey,
      1000000000
    );
    await program.provider.connection.confirmTransaction(signature);

    // Chame a instrução "SendTweet" em nome deste outro usuário.
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet("The Blessing", "Yay Tofu!", {
      accounts: {
        tweet: tweet.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [otherUser, tweet],
    });

    // Busque os detalhes da conta do tweet criado.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Garanta que tenha os dados corretos.
    assert.equal(
      tweetAccount.author.toBase58(),
      otherUser.publicKey.toBase58()
    );
    assert.equal(tweetAccount.topic, "The Blessing");
    assert.equal(tweetAccount.content, "Yay Tofu!");
    assert.ok(tweetAccount.timestamp);
  });

  it("Pode Enviar Um Tweet Sem Tópico e Conteúdo!", async () => {
    // Chame a instrução "SendTweet".
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet("", "", {
      accounts: {
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    });

    // Busque os detalhes da conta do tweet criado.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Garanta que tenha os dados corretos.
    assert.equal(
      tweetAccount.author.toBase58(),
      program.provider.publicKey.toBase58()
    );
    assert.equal(tweetAccount.topic, "");
    assert.equal(tweetAccount.content, "");
    assert.ok(tweetAccount.timestamp);
  });

  it("Pode Pegar Todos Os Tweets!", async () => {
    // Pega todas as requisições que foram utilizadas - no caso todos os tweets!
    const tweetAccounts = await program.account.tweet.all();

    console.log(tweetAccounts);

    // Aqui verifica se todos os tweets, contabilizam 3 (os 3 primeiros que retornaram sucesso!)
    assert.equal(tweetAccounts.length, 4);
  });

  it("Pode Pegar Todos Os Tweets De Um Autor!", async () => {
    const authorPublicKey = program.provider.publicKey;
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: authorPublicKey.toBase58(),
        },
      },
    ]);

    assert.equal(tweetAccounts.length, 3);
    assert.ok(
      tweetAccounts.every((tweetAccount) => {
        return (
          tweetAccount.account.author.toBase58() === authorPublicKey.toBase58()
        );
      })
    );
  });

  it("Pode Pegar Todos Os Tweets De Um Tópico!", async () => {
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset:
            8 + // Discriminator.
            32 + // Author public key.
            8 + // Timestamp.
            4, // Topic string prefix.
          bytes: bs58.encode(Buffer.from("The Blessing")),
        },
      },
    ]);

    assert.equal(tweetAccounts.length, 2);
    assert.ok(
      tweetAccounts.every((tweetAccount) => {
        return tweetAccount.account.topic === "The Blessing";
      })
    );
  });
});
