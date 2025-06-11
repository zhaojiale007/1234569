const { js2xml } = require('xml-js');

// 导出一个处理请求的函数
export default function handler(req, res) {
  const { method } = req;

  // 1. 响应 OPTIONS 请求，告诉客户端这是一个 WebDAV 服务器
  if (method === 'OPTIONS') {
    res.setHeader('Allow', 'OPTIONS, PROPFIND, GET, HEAD');
    res.setHeader('DAV', '1, 2'); // 声明支持 WebDAV Class 1 和 2
    res.setHeader('MS-Author-Via', 'DAV');
    res.status(200).end();
    return;
  }

  // 2. 响应 PROPFIND 请求，这是客户端用来获取目录和文件列表的
  if (method === 'PROPFIND') {
    // 构造一个表示根目录的 XML 响应
    const responseXml = {
      _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
      'D:multistatus': {
        _attributes: { 'xmlns:D': 'DAV:' },
        'D:response': [
          // 第一个响应：根集合本身
          {
            'D:href': { _text: '/dav/' },
            'D:propstat': {
              'D:prop': {
                'D:displayname': { _text: 'Root Collection' },
                'D:creationdate': { _text: new Date().toISOString() },
                'D:getlastmodified': { _text: new Date().toUTCString() },
                'D:resourcetype': { 'D:collection': {} }, // 这是一个集合（目录）
                'D:getcontentlength': { _text: '0' },
                'D:getcontenttype': { _text: 'httpd/unix-directory' },
              },
              'D:status': { _text: 'HTTP/1.1 200 OK' },
            },
          },
          // 你可以在这里添加更多 'D:response' 对象来模拟文件
          {
            'D:href': { _text: '/dav/welcome.txt' },
            'D:propstat': {
              'D:prop': {
                'D:displayname': { _text: 'welcome.txt' },
                'D:creationdate': { _text: new Date().toISOString() },
                'D:getlastmodified': { _text: new Date().toUTCString() },
                'D:resourcetype': {}, // 没有 <D:collection/> 表示是文件
                'D:getcontentlength': { _text: '13' }, // 文件大小
                'D:getcontenttype': { _text: 'text/plain' },
              },
              'D:status': { _text: 'HTTP/1.1 200 OK' },
            },
          }
        ],
      },
    };

    const xmlBody = js2xml(responseXml, { compact: true, spaces: 2 });
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(207).send(xmlBody); // 207 Multi-Status 是 WebDAV 的标准响应码
    return;
  }
  
  // 3. 模拟获取文件内容
  if (method === 'GET' && req.url.endsWith('/welcome.txt')) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('Hello, Vercel!');
    return;
  }

  // 4. 对于不支持的方法，返回 405
  res.setHeader('Allow', 'OPTIONS, PROPFIND, GET, HEAD');
  res.status(405).send('Method Not Allowed');
}