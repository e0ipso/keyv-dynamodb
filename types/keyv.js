// @flow

export interface MapInterface {
  /**
   * Set a value in the store.
   *
   * @param {string} key
   *   The key for the store entry.
   * @param {*} value
   *   The value to set in the store.
   * @param {number} [ttl]
   *   By default keys are persistent. You can set expiry TTL in milliseconds.
   *
   * @return {Promise<void>}
   *   Resolves when the operation is finished.
   */
  set(key: string, value: any, ttl: ?number): Promise<void>;

  /**
   * Get a value from the store
   *
   * @param {string} key
   *   The key for the store entry.
   *
   * @return {Promise<*>}
   *   The stored value.
   */
  get(key: string): Promise<any>;

  /**
   * Remove an item from the store.
   *
   * @param {string} key
   *   The key for the store entry.
   *
   * @return {Promise<*>}
   *   TRUE if items were deleted.
   */
  delete(key: string): Promise<boolean>;

  /**
   * Remove all the items from the store.
   *
   * @return {Promise<void>}
   *   Resolves when the operation is finished.
   */
  clear(): Promise<void>;
};
