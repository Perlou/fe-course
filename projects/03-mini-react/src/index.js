/**
 * Mini React - 入口
 *
 * 统一导出所有 API
 */

const { createElement, h } = require("./createElement");
const { useState, useEffect, useMemo } = require("./hooks");
const { render } = require("./reconciler");
const { SyntheticEvent, EventDelegator } = require("./events");

module.exports = {
  createElement,
  h,
  render,
  useState,
  useEffect,
  useMemo,
  SyntheticEvent,
  EventDelegator,
};
