# Cloudflare Email Routing Setup

Use this checklist in Cloudflare for `creativemk.net`.

## Destination Addresses

Verify these destination addresses in Cloudflare Email Routing:

- `arturo.ordonezv@gmail.com`
- `kmendieta0707@gmail.com`

## Custom Addresses

Create these custom address rules:

- `arturo.ordonez@creativemk.net` -> `arturo.ordonezv@gmail.com`
- `kevin.mendieta@creativemk.net` -> `kmendieta0707@gmail.com`
- `hey@creativemk.net` -> Email Worker using `cloudflare/hey-email-worker.js`

Keep catch-all disabled.

## DNS

Let Cloudflare Email Routing create the required MX, SPF, and DKIM records.
For Gmail Send As, keep one SPF record at the root:

```txt
v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
```

Do not enable strict DMARC until real Gmail Send As test messages pass.
