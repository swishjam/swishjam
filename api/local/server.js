require('dotenv').config({ path: '../.env' });

const express = require('express');
const app = express();
const cors = require('cors');
const port = 8080;
const { processMessages } = require('../src/index');

app.use(express.json());
app.use(express.text());
app.use(cors({ origin: true, credentials: true }));

app.get('/', (_req, res) => res.send('Local Swishjam server running.'));

app.post('/api/events', async (req, res) => {
  const lambdaFormattedPayload = { Records: [{ body: JSON.stringify(req.body) }]};
  await processMessages(lambdaFormattedPayload);
  res.send({ message: 'Processed messages' });
});

app.listen(port, () => {
  console.log(`
   SSSSSSSSSSSSSSS                                      iiii                  hhhhhhh              jjjj                                           
 SS:::::::::::::::S                                    i::::i                 h:::::h             j::::j                                          
S:::::SSSSSS::::::S                                     iiii                  h:::::h              jjjj                                           
S:::::S     SSSSSSS                                                           h:::::h                                                             
S:::::S      wwwwwww           wwwww           wwwwwwwiiiiiii     ssssssssss   h::::h hhhhh      jjjjjjj  aaaaaaaaaaaaa      mmmmmmm    mmmmmmm   
S:::::S       w:::::w         w:::::w         w:::::w i:::::i   ss::::::::::s  h::::hh:::::hhh   j:::::j  a::::::::::::a   mm:::::::m  m:::::::mm 
 S::::SSSS     w:::::w       w:::::::w       w:::::w   i::::i ss:::::::::::::s h::::::::::::::hh  j::::j  aaaaaaaaa:::::a m::::::::::mm::::::::::m
  SS::::::SSSSS w:::::w     w:::::::::w     w:::::w    i::::i s::::::ssss:::::sh:::::::hhh::::::h j::::j           a::::a m::::::::::::::::::::::m
    SSS::::::::SSw:::::w   w:::::w:::::w   w:::::w     i::::i  s:::::s  ssssss h::::::h   h::::::hj::::j    aaaaaaa:::::a m:::::mmm::::::mmm:::::m
       SSSSSS::::Sw:::::w w:::::w w:::::w w:::::w      i::::i    s::::::s      h:::::h     h:::::hj::::j  aa::::::::::::a m::::m   m::::m   m::::m
            S:::::Sw:::::w:::::w   w:::::w:::::w       i::::i       s::::::s   h:::::h     h:::::hj::::j a::::aaaa::::::a m::::m   m::::m   m::::m
            S:::::S w:::::::::w     w:::::::::w        i::::i ssssss   s:::::s h:::::h     h:::::hj::::ja::::a    a:::::a m::::m   m::::m   m::::m
SSSSSSS     S:::::S  w:::::::w       w:::::::w        i::::::is:::::ssss::::::sh:::::h     h:::::hj::::ja::::a    a:::::a m::::m   m::::m   m::::m
S::::::SSSSSS:::::S   w:::::w         w:::::w         i::::::is::::::::::::::s h:::::h     h:::::hj::::ja:::::aaaa::::::a m::::m   m::::m   m::::m
S:::::::::::::::SS     w:::w           w:::w          i::::::i s:::::::::::ss  h:::::h     h:::::hj::::j a::::::::::aa:::am::::m   m::::m   m::::m
 SSSSSSSSSSSSSSS        www             www           iiiiiiii  sssssssssss    hhhhhhh     hhhhhhhj::::j  aaaaaaaaaa  aaaammmmmm   mmmmmm   mmmmmm
                                                                                                  j::::j                                          
                                                                                        jjjj      j::::j                                          
                                                                                       j::::jj   j:::::j                                          
                                                                                       j::::::jjj::::::j                                          
                                                                                        jj::::::::::::j                                           
                                                                                          jjj::::::jjj                                            
                                                                                             jjjjjj                                               
  `)
  console.log(`Local Swishjam server running on port ${port}!`)
});