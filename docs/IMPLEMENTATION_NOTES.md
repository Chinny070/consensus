# Implementation Notes

## Discovery Phase — 2026-07-25

### GenVM Depends Header

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

Source: Official boilerplate `contracts/football_bets.py` and full documentation.

### Imports

```python
import genlayer as gl
from genlayer.types import *
```

v0.3.0+ namespace — `gl.contract.Contract`, `gl.public.view`, `gl.public.write`, etc.

### Contract Base Class

```python
class MyContract(gl.contract.Contract):
```

### Decorators

- `@gl.public.view` — read-only methods
- `@gl.public.write` — state-changing methods
- `@gl.public.write.payable` — methods that receive value
- `@gl.private` — private (default, decorator is no-op)

### Message Context

```python
gl.message.sender_address  # Address — caller
gl.message.value            # u256 — attached value
gl.message.contract_address # Address — this contract
gl.message.chain_id         # u32
gl.message.raw['datetime']  # ISO timestamp string
```

### Value Transfer

```python
# Receive value in payable method:
@gl.public.write.payable
def receive(self):
    amount = gl.message.value

# Send value out:
account = gl.chain.Account(target_address)
account.emit_transfer(amount, on='finalized')
```

### Contract Properties

- `self.address` — contract's own address
- `self.balance` — current balance (u256)

### Storage Types

- `TreeMap[K, V]` — persistent key-value map
- `DynArray[T]` — dynamic array (append, pop, insert, clear)
- `Array[T, N]` — fixed-size array
- `@gl.storage.allow` — decorator to mark dataclass as storage-compatible (replaces `@allow_storage`)
- `gl.storage.Pickled[T]` — store arbitrary picklable objects

Note: boilerplate uses `@allow_storage` (v0.1.x compat alias). We use `@gl.storage.allow` per v0.3.0 docs BUT will verify with linter.

### Integer Types

`u8` through `u256`, `i8` through `i256`, `bigint`
`Address` — 20-byte address with `.as_hex`, `.ZERO`

### Error Handling

```python
raise gl.vm.UserError("message")
gl.vm.UserError.immediate("message")  # immediate revert
```

### Non-Deterministic APIs

```python
# LLM call
result = gl.nondet.exec_prompt(prompt, response_format='json')

# Web fetch
response = gl.nondet.web.get(url)
rendered = gl.nondet.web.render(url, mode='text')

# Custom equivalence (leader/validator)
result = gl.vm.run_nondet(leader_fn, validator_fn)
result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

# Built-in equivalence
result = gl.eq_principle.strict_eq(fn)
```

### Equivalence Principles

For non-deterministic adjudication, use `gl.vm.run_nondet()` with custom leader and validator functions. Do NOT use `strict_eq` for LLM prose or live web content.

### GenLayerJS 1.1.8

```typescript
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus, GenLayerClient } from "genlayer-js/types";

// Create client
const client = createClient({ chain: studionet, account: address });

// Read
const result = await client.readContract({
  address: contractAddress,
  functionName: "method_name",
  args: [],
});

// Write (payable)
const txHash = await client.writeContract({
  address: contractAddress,
  functionName: "method_name",
  args: [arg1, arg2],
  value: BigInt(amount),
});

// Wait for receipt
const receipt = await client.waitForTransactionReceipt({
  hash: txHash,
  status: "ACCEPTED",
  retries: 24,
  interval: 5000,
});
```

### Direct Test Fixtures

From `genlayer-test` package:
- `direct_vm` — VM instance with `.sender`, `.expect_revert()`, `.mock_web()`, `.mock_llm()`
- `direct_deploy(path)` — deploys contract, returns callable proxy
- `direct_alice`, `direct_bob` — test account addresses

### CLI Commands

```bash
genvm-lint check contracts/consensus.py --json
pytest tests/direct/ -v
gltest tests/integration/ -v -s
genlayer network set studionet
genlayer deploy contracts/consensus.py
genlayer schema <ADDRESS>
```

### Blockers & Decisions

- `gl.chain.Account` and `emit_transfer` — need to verify with linter. If unsupported, will use alternative value transfer pattern.
- `@allow_storage` vs `@gl.storage.allow` — boilerplate uses the old form. Will test both with linter.
- `gl.message.raw['datetime']` for timestamp — need to verify availability on StudioNet.
