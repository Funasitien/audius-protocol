import type { TransactionReceipt } from 'web3-core'
import Web3 from '../../utils/web3'
import type Web3Type from 'web3'
import type { AbiItem } from 'web3-utils'
import fetch, { Headers } from 'cross-fetch'

// TODO: move into sdk?
import * as signatureSchemas from '../../../data-contracts/signatureSchemas'
import { abi as EntityManagerABI } from '../../../data-contracts/ABIs/EntityManager.json'

import { mergeConfigWithDefaults } from '../../utils/mergeConfigs'
import type { AuthService } from '../Auth'
import type { Contract } from 'web3-eth-contract'
import { defaultEntityManagerConfig, DEFAULT_GAS_LIMIT } from './constants'
import type {
  Action,
  EntityManagerConfig,
  EntityManagerService,
  EntityType
} from './types'

export class EntityManager implements EntityManagerService {
  /**
   * Configuration passed in by consumer (with defaults)
   */
  private readonly config: EntityManagerConfig

  private readonly contract: Contract
  private readonly web3: Web3Type

  constructor(config?: EntityManagerConfig) {
    this.config = mergeConfigWithDefaults(config, defaultEntityManagerConfig)
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(this.config.web3ProviderUrl, {
        timeout: 10000
      })
    )
    this.contract = new this.web3.eth.Contract(
      EntityManagerABI as AbiItem[],
      this.config.contractAddress
    )
  }

  /**
   * Calls the manage entity method on chain
   * @param {number} userId The numeric user id
   * @param {EntityType} entityType The type of entity being modified
   * @param {number} entityId The id of the entity
   * @param {Action} action Action being performed on the entity
   * @param {string} metadata CID multihash or metadata associated with action
   */
  async manageEntity({
    userId,
    entityType,
    entityId,
    action,
    metadata,
    auth
  }: {
    userId: number
    entityType: EntityType
    entityId: number
    action: Action
    metadata: string
    auth: AuthService
  }): Promise<{ txReceipt: TransactionReceipt }> {
    const nonce = signatureSchemas.getNonce()
    const chainId = await this.web3.eth.net.getId()
    const signatureData = signatureSchemas.generators.getManageEntityData(
      chainId,
      this.config.contractAddress,
      userId,
      entityType,
      entityId,
      action,
      metadata,
      nonce
    )

    const senderAddress = await auth.getAddress()
    const signature = await auth.signTransaction(signatureData)

    const method = await this.contract.methods.manageEntity(
      userId,
      entityType,
      entityId,
      action,
      metadata,
      nonce,
      signature
    )

    const response = await fetch(`${this.config.identityServiceUrl}/relay`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        contractAddress: this.config.contractAddress,
        contractRegistryKey: 'EntityManager',
        encodedABI: method.encodeABI(),
        // Gas limit not really needed with ACDC
        gasLimit: DEFAULT_GAS_LIMIT,
        senderAddress
      })
    })

    const jsonResponse = await response.json()

    return {
      txReceipt: jsonResponse.receipt
    }
  }
}
