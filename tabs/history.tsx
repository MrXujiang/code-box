import { DownOutlined, ExclamationCircleFilled } from "@ant-design/icons"
import {
  Avatar,
  Button,
  Input,
  Layout,
  List,
  message,
  Modal,
  Skeleton,
  Space
} from "antd"
import type { MenuProps } from "antd"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"

import "./history.css"

import { useStorage } from "@plasmohq/storage/hook"

import { ThemeProvider } from "~theme"

const { Content } = Layout

interface DataType {
  id?: string
  value?: string
  createdAt?: string
  from?: string
  link?: string
  tags?: Array<string>
  remark?: string
  loading: boolean
  expand: boolean
}

let pageSize = 20
let pageNumber = 1

export default function HistoryPage() {
  const [history, setHistory] = useStorage<DataType[]>("codebox-history", [])
  const [initLoading, setInitLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DataType[]>([])
  const [list, setList] = useState<DataType[]>([])
  const [filterVal, setFilterVal] = useState("")
  const [isMore, setIsMore] = useState(false)

  useEffect(() => {
    filterHistory()
  }, [filterVal])

  useEffect(() => {
    console.log("history", history)
    setInitLoading(false)
    if (history.length) {
      let records = paginate()
      setData(records)
      setList(records)
    }
  }, [history])

  function paginate() {
    let startIndex = (pageNumber - 1) * pageSize
    let endIndex = pageNumber * pageSize
    let records = history.slice(startIndex, endIndex)
    setIsMore(records.length >= pageSize)
    return records
  }

  function filterHistory() {
    const _filterVal = String(filterVal).trim().toLowerCase()
    let _list = []
    if (filterVal) {
      const searchProps = ["value", "createdAt", "link", "remark"]
      const filterRE = new RegExp(filterVal, "gi")
      const rest = data.filter((item: any) =>
        searchProps.some(
          (key) => String(item[key]).toLowerCase().indexOf(_filterVal) > -1
        )
      )
      _list = rest.map((row) => {
        const item = Object.assign({}, row) as any
        searchProps.forEach((key) => {
          item[key] = String(item[key]).replace(
            filterRE,
            (match) => `<span class="keyword-lighten">${match}</span>`
          )
        })
        return item
      })
    } else {
      _list = [...data]
    }

    setList(_list)
    window.dispatchEvent(new Event("resize"))
  }

  function onLoadMore() {
    setLoading(true)
    setList(
      data.concat(
        [...new Array(pageSize)].map(() => ({
          value: "",
          from: "",
          loading: true,
          expand: false
        }))
      )
    )
    pageNumber += 1
    let records = paginate()
    const newData = data.concat(records)
    setData(newData)
    setList(newData)
    setLoading(false)
    window.dispatchEvent(new Event("resize"))
  }

  const loadMore =
    !initLoading && !loading && isMore ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px"
        }}>
        <Button onClick={onLoadMore}>加载更多</Button>
      </div>
    ) : null

  function handleDeleteAll() {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleFilled />,
      content: "是否删除全部记录?",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      async onOk() {
        setHistory([])
      },
      onCancel() {
        console.log("Cancel")
      }
    })
  }

  function handleCopy(item) {
    navigator.clipboard.writeText(item.value)
    message.success("复制成功！")
  }

  function handleDelete(item) {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleFilled />,
      content: "是否删除当前记录?",
      okText: "确定",
      cancelText: "取消",
      async onOk() {
        setHistory((prevData) =>
          prevData.filter((_item) => _item.id != item.id)
        )
      },
      onCancel() {
        console.log("Cancel")
      }
    })
  }

  function handleMore(item) {
    item.expand = !item.expand
  }

  return (
    <ThemeProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16
        }}>
        <h2>历史列表</h2>
        {/*<div>*/}
        {/*  <a key="list-delete-all" onClick={handleDeleteAll}>*/}
        {/*    删除全部*/}
        {/*  </a>*/}
        {/*</div>*/}
        <Content className="content">
          <Input
            placeholder="搜索"
            onChange={(e) => setFilterVal(e.target.value)}
          />
          <List
            className="demo-loadmore-list"
            loading={initLoading}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={list}
            renderItem={(item) => (
              <List.Item
                actions={
                  item.id
                    ? [
                        <a key="list-copy" onClick={() => handleCopy(item)}>
                          复制
                        </a>,
                        <a key="list-delete" onClick={() => handleDelete(item)}>
                          删除
                        </a>
                        // <a key="list-more" onClick={() => handleMore(item)}>
                        //   更多
                        // </a>
                      ]
                    : []
                }>
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: "#fde3cf",
                          color: "#f56a00"
                        }}>
                        {item.from[0]}
                      </Avatar>
                    }
                    title={
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        dangerouslySetInnerHTML={{
                          __html: dayjs(item.createdAt).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        }}
                      />
                    }
                    description={`${item.value.slice(0, 80)}`}
                  />
                </Skeleton>
              </List.Item>
            )}
          />
        </Content>
      </div>
    </ThemeProvider>
  )
}
