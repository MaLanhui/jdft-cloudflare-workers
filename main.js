addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const apiUrl =
    'https://api.cntv.cn/NewVideo/getVideoListByColumn?id=TOPC1451558976694518&n=20&sort=desc&mode=0&serviceId=tvcctv';

  // 获取当前页面参数，如果没有则默认为第一页
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || '1';

  // 构建 API 请求 URL
  const apiRequest = new Request(`${apiUrl}&p=${page}`);

  // 获取 API 数据
  const response = await fetch(apiRequest);

  // 将响应内容转换为 UTF-8 编码
  const responseData = await response.arrayBuffer();
  const text = new TextDecoder('utf-8').decode(responseData);
  const data = JSON.parse(text);

  // 创建 HTML 页面
  const html = createHTMLPage(data);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function createHTMLPage(data) {
  // 解析 API 数据并构建 HTML 页面
  const newsList = data.data.list.map((item) => {
    const videoLink = `<a href="${item.url}" class="list-group-item list-group-item-action">${item.title}</a>`;
    return `<div class="d-flex w-100 justify-content-between">${videoLink}<small>${item.time}</small></div>`;
  });

  // 构建分页按钮
  const currentPage = data.data.page;
  const totalPages = Math.ceil(data.data.total / 20);
  const pagination = createPagination(currentPage, totalPages);

  // 引入 Bootstrap CDN
  const bootstrapCDN = `
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.3/css/all.css">
    `;

  // 添加自定义样式
  const customStyle = `
    <style>
      body {
        background-color: #f0f0f0;
      }
      .container {
        max-width: 800px;
        margin-top: 20px;
      }
      .list-group-item {
        color: #333;
      }
      .list-group-item:hover {
        color: #fff;
        background-color: #007bff;
      }
      .pagination {
        justify-content: center;
      }
      .page-link {
        color: #007bff;
      }
      .page-link:hover {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
      }
      .page-item.active .page-link {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
      }
    </style>
    `;

  // 构建 HTML 页面
  const html = `
    <html>
      <head>
        <title>采集网站</title>
        ${bootstrapCDN}
        ${customStyle}
      </head>
      <body>
        <div class="container">
          <h1 class="text-center"><i class="fas fa-newspaper"></i> 新闻列表</h1>
          <div class="list-group">${newsList.join('')}</div>
          <nav>${pagination}</nav>
        </div>
      </body>
    </html>
  `;

  return html;
}

function createPagination(currentPage, totalPages) {
  let pagination = '<ul class="pagination">';
  const maxVisibleButtons = 5; // 可见的页码按钮数量

  if (totalPages > 1) {
    pagination += `<li class="page-item"><a class="page-link" href="?page=1">首页</a></li>`;
    if (currentPage > 1) {
      pagination += `<li class="page-item"><a class="page-link" href="?page=${currentPage - 1}">上一页</a></li>`;
    }

    const startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (startPage > 1) {
      pagination += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i === currentPage) {
        pagination += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
      } else {
        pagination += `<li class="page-item"><a class="page-link" href="?page=${i}">${i}</a></li>`;
      }
    }

    if (endPage < totalPages) {
      pagination += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    if (currentPage < totalPages) {
      pagination += `<li class="page-item"><a class="page-link" href="?page=${currentPage + 1}">下一页</a></li>`;
    }
    pagination += `<li class="page-item"><a class="page-link" href="?page=${totalPages}">尾页</a></li>`;
  }

  pagination += '</ul>';
  return pagination;
}
