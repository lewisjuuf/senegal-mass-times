# Robust PCA of curve changes (S-PCA + weighted EMPCA)

Robust principal components for daily curve changes when a few days dominate the
sum of squares, e.g. one 20 bp credit move in a 6-month window of 1–2 bp days.

## Contents

| Path | What it is |
|---|---|
| `paper/robust_empca.pdf` | Technical note: classical PCA (Hotelling, Eckart–Young), influence of one large day, M-scales, S-PCA (Maronna 2005), monotone descent, robust EMPCA, numerical checks |
| `paper/robust_empca.tex` | LaTeX source |
| `code/robpca.py` | Implementation: `spca` (replicates `RobStatTM::pcaRobS`), `robust_empca` (outer M-scale reweighting around Bailey's EMPCA), `rotate_within` (Stage 2, MCD on scores), `norm_cap` |
| `code/experiments.py` | Reproduces every number in the paper's tables (writes to `code/out/`; E1 needs R with `RobStatTM`) |
| `code/test_pca.R` | Quick R comparison of classical, norm-capped and robust PCA |
| `third_party/empca/` | Bailey (2012) weighted EMPCA, unmodified, BSD licence |

## Usage

```python
import numpy as np
from robpca import robust_empca, rotate_within

# X: n_days x n_tenors daily changes; omega: same shape, 0 for missing (optional)
fit = robust_empca(X, q=3, omega=None, delta=0.5, mstep="exact")
A, robust_var = rotate_within(X, fit["mu"], fit["B"], coeff=fit["coeff"])
# A: robust loadings (columns), robust_var: robust component variances
# fit["W"]: day weights (a large off-span day gets weight 0)
```

Choices: `q`; `delta` in [0.25, 0.5]; noise/missing weights `omega`; `mstep="exact"`
keeps the descent guarantee (Bailey's sequential step works but is not guaranteed
monotone). Stage 2 is needed whenever the individual PCs are interpreted or traded,
not only the subspace.

Requirements: `numpy`, `scipy`, `scikit-learn`.

## References

- Bailey, S. (2012). Principal component analysis with noisy and/or missing data. *PASP* 124, 1015–1023.
- Maronna, R. (2005). Principal components and orthogonal regression based on robust scales. *Technometrics* 47, 264–273.
- Maronna, Martin, Yohai & Salibián-Barrera (2019). *Robust Statistics: Theory and Methods (with R)*, 2nd ed., Wiley.
- Rousseeuw, P.J. & Van Driessen, K. (1999). A fast algorithm for the MCD estimator. *Technometrics* 41, 212–223.
