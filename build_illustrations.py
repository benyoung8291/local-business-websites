"""Rig the original artwork with SVG masks. Source WebPs remain byte-for-byte intact."""
from pathlib import Path
ROOT = Path(__file__).parent
OUT = ROOT/'templates/illustrations'

def puppet(name, file, width, height, joints, patches=''):
    image=f'<image id="{name}-pixels" href="/assets/{file}.webp" width="{width}" height="{height}"/>'
    defs=image+''.join(f'<clipPath id="{name}-{key}-clip"><path d="{path}"/></clipPath>' for key,path,pivot in joints)
    defs+=f'<mask id="{name}-body" maskUnits="userSpaceOnUse" x="0" y="0" width="{width}" height="{height}"><rect width="{width}" height="{height}" fill="white"/>'+''.join(f'<path d="{path}" fill="black"/>' for key,path,pivot in joints)+'</mask>'
    defs+=f'<mask id="{name}-silhouette" maskUnits="userSpaceOnUse" x="0" y="0" width="{width}" height="{height}" style="mask-type:alpha"><use href="#{name}-pixels"/></mask>'
    patches=f'<g mask="url(#{name}-silhouette)">{patches}</g>'
    layers=''.join(f'<g data-act="{key}" style="transform-origin:{pivot[0]}px {pivot[1]}px"><use href="#{name}-pixels" clip-path="url(#{name}-{key}-clip)"/></g>' for key,path,pivot in joints)
    return f'<defs>{defs}</defs>{patches}<use href="#{name}-pixels" mask="url(#{name}-body)"/>{layers}'

def build():
    worker=puppet('tradesman','character-tradesman',731,900,[
      ('worker-head','M160 0H495V216L380 224L350 260L321 282L288 255L260 220H160Z',(319,248)),
      ('worker-arm','M91 393Q139 362 194 390L220 417Q266 433 311 415Q360 389 395 437L401 468L343 479L294 465Q198 499 133 486Q76 468 91 393Z',(135,414)),
      ('worker-foot','M243 716L365 688L410 775L437 796V889H237Z',(308,730)),
    ],'<path d="M279 225 351 223 350 282 319 298 285 263Z" fill="#fba575"/><path d="M119 398Q204 402 291 435L289 462 139 468Z" fill="#fb9d6b"/>')
    connector=puppet('connector','character-connector',814,900,[
      ('connector-head','M65 65H457V178L424 200L409 219L403 244L361 245L340 238L311 259L257 280L203 306L145 329L91 308Z',(376,237)),
      ('connector-foot','M142 733L270 747L307 842L298 883H105L115 782Z',(211,769)),
      ('connector-hand','M576 20H764V169L714 193L683 216L658 226L613 199L594 168L566 133Z',(659,195)),
    ],'<path d="M346 211 407 216 408 250Q374 271 349 248Z" fill="#feaf7f"/><path d="M623 171 689 177 686 217 650 231 614 207Z" fill="#feaf7f"/>')
    # A signal runs along the existing illustrated cable, rather than moving the entire person.
    connector+='<path data-act="live-cable" pathLength="1" d="M89 570C150 421 217 579 315 496S426 344 462 298 510 151 594 98M707 145C793 269 704 388 666 480Q641 535 659 570" fill="none" stroke="#fff9de" stroke-width="6" stroke-linecap="round"/>'
    owner=puppet('owner','character-owner',790,900,[
      ('owner-head','M310 0H660V204L518 223L463 239L426 228L407 264L378 340L358 388L318 396L279 364L311 278L350 206L334 162Z',(350,365)),
      ('owner-hand','M342 344L430 327L492 339L519 373L497 397L417 394L398 451L372 469L341 449L328 416Z',(486,366)),
      ('owner-foot','M655 645L748 654L770 724L742 855L688 883L656 846L669 750Z',(701,691)),
    ],'<path d="M322 336 377 340 372 387 329 393 309 371Z" fill="#ad693d"/><path d="M343 388 417 388 404 456 343 455Z" fill="#5775f3"/>')
    cast=f'''<svg class="living-cast original-art" data-live-scene="hero" viewBox="0 0 1040 480" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
<svg x="0" y="26" width="352" height="434" viewBox="0 0 731 900" overflow="visible">{worker}</svg>
<svg x="324" y="0" width="426" height="471" viewBox="0 0 814 900" overflow="visible">{connector}</svg>
<svg x="680" y="29" width="365" height="416" viewBox="0 0 790 900" overflow="visible">{owner}</svg></svg>'''
    builder=puppet('builder','toolbox',750,750,[
      ('builder-head','M122 20H395V209L340 222L316 246L272 233L252 216H128Z',(291,221)),
      ('builder-arm','M302 415L340 430L395 461L438 491L448 567L403 578L346 536L314 487L289 460Z',(323,448)),
      ('builder-other-hand','M455 350L520 350L612 399L616 472L573 515L518 510L502 460L466 439L448 414Z',(487,397)),
      ('puzzle-piece','M404 486L457 481L457 464Q461 443 489 450L505 477L531 468L553 476L577 566L569 590L526 609L511 578L490 572L474 590L477 614L430 618Z',(481,536)),
      ('app-tile-one','M395 0H576L583 200L415 233L386 95Z',(485,123)),
      ('app-tile-two','M588 92L750 107V280L553 270L565 160Z',(652,186)),
      ('app-tile-three','M582 257L713 300L669 405L538 362Z',(628,337)),
    ],'<path d="M167 197Q219 190 264 213L272 235 168 224Z" fill="#f06848"/><path d="M446 340Q483 337 507 362L489 386 448 380Z" fill="#f06848"/><path d="M300 416 326 410 398 468 442 511 435 552 353 512 307 447Z" fill="#ad6b3e"/><path d="M264 194 324 198 322 240 287 254 266 232Z" fill="#ad6b3e"/><path d="M310 435 351 447 351 487 316 478Z" fill="#ad6b3e"/><path d="M420 509 538 487 566 584 431 613Z" fill="#3d5da9"/>')
    builder=f'<svg class="builder-illustration original-art" data-live-scene="builder" viewBox="-20 -10 790 790" role="img" aria-label="A business owner fitting a puzzle piece into her toolbox as the tools come together." xmlns="http://www.w3.org/2000/svg">{builder}</svg>'
    coffee=puppet('ben','ben-young-coffee',750,821,[
      ('ben-head','M278 0H490V206L429 215L417 245L376 255L354 218L287 207Z',(386,227)),
      ('ben-laptop','M89 211H275L292 319L385 336L384 368L249 388L235 406L143 387L113 340Z',(294,344)),
      ('ben-arm','M495 327L568 312L610 403L554 478L563 524L537 579L479 571L454 533L474 452L519 407Z',(534,354)),
      ('ben-leg','M39 522L131 523L184 566L198 668L175 721L93 711L0 647L0 574Z',(143,558)),
      ('coffee-task','M596 237H739V386L586 365Z',(660,301)),
      ('coffee-note','M548 113H696V236H550Z',(610,175)),
    ],'<path d="M353 204 423 206 420 248 374 261Z" fill="#fbaa7a"/><path d="M270 297 331 309 348 367 251 384Z" fill="#352e2e"/><path d="M479 474 552 467 549 568 478 575Z" fill="#fcd948"/><path d="M503 331 563 332 577 393 528 407Z" fill="#ffa97f"/>')
    coffee=f'<svg class="coffee-illustration original-art" data-live-scene="coffee" viewBox="-20 -10 790 855" role="img" aria-label="The original illustrated Ben with his laptop, nodding and moving his hand beside a coffee." xmlns="http://www.w3.org/2000/svg">{coffee}</svg>'
    OUT.mkdir(exist_ok=True,parents=True)
    for name,svg in [('cast',cast),('builder',builder),('coffee',coffee)]: (OUT/(name+'.svg')).write_text(svg+'\n')
if __name__ == '__main__': build()
