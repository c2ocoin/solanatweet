//*Aqui Fazemos Os Imports;
import { computed } from 'vue'
import { useAnchorWallet } from 'solana-wallets-vue'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorProvider } from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
//import idl from '../../../target/idl/solana_twitter.json'
import idl from '@/idl/solana_twitter.json'

const preflightCommitment = 'processed'
const commitment = 'processed'

const clusterUrl = process.env.VUE_APP_CLUSTER_URL

const programID = new PublicKey(idl.metadata.address)

//*Definimos A Variável Com 'Null' Antes De Usar
let workspace = null

//*Exportamos Nossa Variavel 'workspace'
export const useWorkspace = () => workspace;

export const initWorkspace = () => {
  //*Aqui, Com O Metodo 'InintWorkSpace'
  const wallet = useAnchorWallet()
  
  //Desenvolvimento - Produção;
  const connection = new Connection(clusterUrl, commitment)

  const provider = computed(() => new AnchorProvider(connection, wallet.value, { preflightCommitment, commitment }))
  const program = computed(() => new Program(idl, programID, provider.value))

  workspace = {
    wallet,
    connection,
    provider,
    program,
  }
}
