suppressMessages(library(RobStatTM))
set.seed(1)
n <- 750; p <- 10; tau <- c(0.25,0.5,1,2,3,5,7,10,20,30)
L <- cbind(1, exp(-tau/2), (tau/2)*exp(-tau/2))            # level/slope/curve (Nelson-Siegel)
L <- qr.Q(qr(L))                                           # orthonormal true loadings
F <- cbind(rnorm(n,0,6), rnorm(n,0,3), rnorm(n,0,1.5))
X <- F %*% t(L) + matrix(rnorm(n*p,0,0.4), n, p)
med <- median(sqrt(rowSums(X^2)))
shock <- c(rep(1,4), -seq(0.3,1,length=6)); shock <- shock/sqrt(sum(shock^2))
X[400,] <- 18*med*shock                                     # one 18x day, odd shape

top <- function(C,k=3) eigen(C, symmetric=TRUE)$vectors[,1:k]
cosv <- function(B) round(abs(diag(t(B) %*% L)), 3)         # per-PC |cos| with truth
ang  <- function(B) round(acos(min(svd(t(B)%*%L)$d))*180/pi, 1) # max principal angle (deg)

Xc <- scale(X, scale=FALSE)
r  <- sqrt(rowSums(Xc^2)); w <- pmin(1, 4*median(r)/r)
res <- list(
  "classic"                = top(cov(X)),
  "classic, day dropped"   = top(cov(X[-400,])),
  "cap: weight w (Bailey)" = top(crossprod(Xc*sqrt(w))/sum(w)),
  "cap: rows scaled by w"  = top(crossprod(Xc*w)/sum(w^2)),
  "spherical (unit norm)"  = top(crossprod(Xc/r)),
  "covRob (MM)"            = top(covRob(X, type="MM")$cov),
  "pcaRobS"                = pcaRobS(X, 3, desprop=1)$eigvec)
out <- t(sapply(res, function(B) c(cosv(B), maxangle=ang(B))))
colnames(out) <- c("PC1","PC2","PC3","max angle")
print(out)
cat("\nweight given to shock day: w =", round(w[400],3), " pcaRobS bisquare -> 0 beyond cutoff\n")
