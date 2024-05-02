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

  const sendTweet = async (author, topic, content) => {
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet(topic, content, {
      accounts: {
        tweet: tweet.publicKey,
        author,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    });

    return tweet;
  };
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
  it("Pode Mandar Um Novo Tweet!", async () => {
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet("veganism", "Hummus, am I right?", {
      accounts: {
        tweet: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    });
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    assert.equal(
      tweetAccount.author.toBase58(),
      program.provider.publicKey.toBase58()
    );
    assert.equal(tweetAccount.topic, "veganism");
    assert.equal(tweetAccount.content, "Hummus, am I right?");
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

  it("Pode Editar Um Tweet;", async () => {
    // Send a tweet and fetch its account.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, "web2", "Hello World!");
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    assert.equal(tweetAccount.topic, "web2");
    assert.equal(tweetAccount.content, "Hello World!");

    // Update the Tweet.
    await program.rpc.updateTweet("solana", "gm everyone!", {
      accounts: {
        tweet: tweet.publicKey,
        author
      },
    });

    // Ensure the updated tweet has the updated data.
    const updatedTweetAccount = await program.account.tweet.fetch(
      tweet.publicKey
    );
    assert.equal(updatedTweetAccount.topic, "solana");
    assert.equal(updatedTweetAccount.content, "gm everyone!");
  });

  it("Não Pode Editar O Tweet De Outra Pessoa;", async () => {
    // Send a tweet.
    const author = program.provider.                                                                                                                                                                                                                                                                                                                                      publicKey;
    const tweet = await sendTweet(author, "solana", "Solana is awesome!");

    // Update the Tweet.
    try {
      await program.rpc.updateTweet("eth", "Ethereum is awesome!", {
        accounts: {
          tweet: tweet.publicKey,
          author: anchor.web3.Keypair.generate().publicKey,
        },
      });
      assert.fail("We were able to update someone else's tweet.");
    } catch (error) {
      // Ensure the tweet account kept the initial data.
      const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
      assert.equal(tweetAccount.topic, "solana");
      assert.equal(tweetAccount.content, "Solana is awesome!");
    }
  });

  it('Pode Deletar Um Tweeet;', async () => {
    // Create a new tweet.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, 'solana', 'gm');

    // Delete the Tweet.
    await program.rpc.deleteTweet({
        accounts: {
            tweet: tweet.publicKey,
            author,
        },
    });

    // Ensure fetching the tweet account returns null.
    const tweetAccount = await program.account.tweet.fetchNullable(tweet.publicKey);
    assert.ok(tweetAccount === null);
});

it('Não Pode Deletar Um Tweet De Outra Pessoa;', async () => {
    // Create a new tweet.
    const author = program.provider.publicKey;
    const tweet = await sendTweet(author, 'solana', 'gm');

    // Try to delete the Tweet from a different author.
    try {
        await program.rpc.deleteTweet({
            accounts: {
                tweet: tweet.publicKey,
                author: anchor.web3.Keypair.generate().publicKey,
            },
        });
        assert.fail('We were able to delete someone else\'s tweet.');
    } catch (error) {
        // Ensure the tweet account still exists with the right data.
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
        assert.equal(tweetAccount.topic, 'solana');
        assert.equal(tweetAccount.content, 'gm');
    }
});
});
