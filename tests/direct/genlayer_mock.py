"""Minimal genlayer stub so the contract module can be imported outside GenVM."""

import sys
import types
from unittest.mock import MagicMock

u256 = int
u32 = int
u64 = int
u128 = int
Address = str


class _TreeMap(dict):
    def __class_getitem__(cls, params):
        return dict


class _DynArray(list):
    def __class_getitem__(cls, params):
        return list


TreeMap = _TreeMap
DynArray = _DynArray


def allow_storage(cls):
    return cls


def _install():
    if "genlayer" in sys.modules:
        return

    gl = types.ModuleType("genlayer")

    gl.public = MagicMock()
    gl.contract = MagicMock()
    gl.Contract = object

    class _UserError(Exception):
        pass

    gl.vm = MagicMock()
    gl.vm.UserError = _UserError
    gl.vm.Return = type("Return", (), {})
    gl.nondet = MagicMock()
    gl.chain = MagicMock()
    gl.message = MagicMock()

    gl.u256 = u256
    gl.u32 = u32
    gl.u64 = u64
    gl.u128 = u128
    gl.Address = Address
    gl.TreeMap = TreeMap
    gl.DynArray = DynArray
    gl.allow_storage = allow_storage

    gl.__all__ = [
        "gl", "u256", "u32", "u64", "u128", "Address",
        "TreeMap", "DynArray", "allow_storage",
    ]

    gl.gl = gl

    sys.modules["genlayer"] = gl


_install()
